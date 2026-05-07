//! HTTP client with token-based authentication for 禅道 API v2.
//!
//! Handles GET/POST/PUT/DELETE requests, auto-injects token, and supports
//! 401 auto-refresh via AuthManager.

use std::cell::RefCell;
use std::rc::Rc;

use serde_json::Value;

use crate::auth::AuthManager;

const API_PATH_PREFIX: &str = "/api.php/v2";

pub struct Client {
    pub base_url: String,
}

pub struct AuthenticatedClient {
    client: Client,
    auth: Rc<RefCell<AuthManager>>,
    token: String,
}

impl Client {
    pub fn new(base_url: String) -> Self {
        Client { base_url }
    }

    pub fn authenticate(&self, auth: &Rc<RefCell<AuthManager>>) -> Result<AuthenticatedClient, String> {
        let token = auth.borrow_mut().get_token(&self.base_url)?;
        Ok(AuthenticatedClient {
            client: Client {
                base_url: self.base_url.clone(),
            },
            auth: Rc::clone(auth),
            token,
        })
    }
}

impl AuthenticatedClient {
    fn build_url(&self, endpoint: &str) -> String {
        let clean = if endpoint.starts_with('/') {
            endpoint
        } else {
            endpoint
        };
        format!("{}{}{}", self.client.base_url, API_PATH_PREFIX, clean)
    }

    fn do_request(
        &mut self,
        method: &str,
        url: &str,
        body: Option<&Value>,
    ) -> Result<ureq::Response, String> {
        let req = ureq::request(method, url)
            .set("Content-Type", "application/json")
            .set("token", &self.token);

        let resp = match body {
            Some(b) => req.send_json(b),
            None => req.send_string(""),
        };

        match resp {
            Ok(r) => Ok(r),
            Err(ureq::Error::Status(401, _)) => {
                // Token expired, refresh and retry
                self.token = self
                    .auth
                    .borrow_mut()
                    .refresh_token(&self.client.base_url)?;

                let req2 = ureq::request(method, url)
                    .set("Content-Type", "application/json")
                    .set("token", &self.token);

                let resp2 = match body {
                    Some(b) => req2.send_json(b),
                    None => req2.send_string(""),
                };

                resp2.map_err(|e| format!("请求失败 (重试后): {}", e))
            }
            Err(ureq::Error::Status(s, _)) => Err(format!("请求失败 (HTTP {})", s)),
            Err(ureq::Error::Transport(e)) => Err(format!("网络错误: {}", e)),
        }
    }

    pub fn get(&mut self, endpoint: &str) -> Result<Value, String> {
        let url = self.build_url(endpoint);
        let resp = self.do_request("GET", &url, None)?;
        let body: Value = resp.into_json().map_err(|e| format!("JSON 解析失败: {}", e))?;
        Self::check_response(body)
    }

    pub fn post(&mut self, endpoint: &str, body: &Value) -> Result<Value, String> {
        let url = self.build_url(endpoint);
        let resp = self.do_request("POST", &url, Some(body))?;
        let body: Value = resp.into_json().map_err(|e| format!("JSON 解析失败: {e}"))?;
        Self::check_response(body)
    }

    /// Upload a file via multipart/form-data using `curl` CLI.
    pub fn post_multipart(
        &mut self,
        endpoint: &str,
        _fields: &[(&str, &str)],
        _file_field: &str,
        _file_path: &str,
        _file_name: Option<&str>,
    ) -> Result<Value, String> {
        // Delegate to curl-based method
        self.post_multipart_curl(endpoint, _fields, _file_field, _file_path)
    }

    /// Upload a file via multipart/form-data using `curl` CLI with explicit args.
    fn post_multipart_curl(
        &mut self,
        endpoint: &str,
        fields: &[(&str, &str)],
        file_field: &str,
        file_path: &str,
    ) -> Result<Value, String> {
        let url = self.build_url(endpoint);
        let mut cmd = std::process::Command::new("curl");
        cmd.arg("-s")
            .arg("-X")
            .arg("POST")
            .arg("-H")
            .arg(format!("token: {}", self.token));
        for (name, value) in fields {
            cmd.arg("-F").arg(format!("{}={}", name, value));
        }
        cmd.arg("-F")
            .arg(format!("{}@{}", file_field, file_path));
        cmd.arg(&url);

        let output = cmd
            .output()
            .map_err(|e| format!("curl 执行失败: {e}"))?;

        let stdout = String::from_utf8_lossy(&output.stdout);
        let stderr = String::from_utf8_lossy(&output.stderr);

        if !output.status.success() {
            let code = output.status.code().unwrap_or(-1);
            // 401 → refresh token and retry once
            if code == 401 || stdout.contains("Not allowed") {
                self.token = self
                    .auth
                    .borrow_mut()
                    .refresh_token(&self.client.base_url)?;
                // Recursive retry (at most once, since retry won't 401 again)
                return self.post_multipart_curl(endpoint, fields, file_field, file_path);
            }
            return Err(format!("curl 返回错误 ({code}): {stderr}"));
        }

        let body: Value = serde_json::from_str(&stdout)
            .map_err(|e| format!("JSON 解析失败: {e} (body: {stdout:.300})"))?;

        Self::check_response(body)
    }

    pub fn put(&mut self, endpoint: &str, body: &Value) -> Result<Value, String> {
        let url = self.build_url(endpoint);
        let resp = self.do_request("PUT", &url, Some(body))?;
        let body: Value = resp.into_json().map_err(|e| format!("JSON 解析失败: {}", e))?;
        Self::check_response(body)
    }

    pub fn delete(&mut self, endpoint: &str) -> Result<Value, String> {
        let url = self.build_url(endpoint);
        let resp = self.do_request("DELETE", &url, None)?;
        // DELETE may return 200 + empty body or 204
        let status = resp.status();
        if status == 204 {
            return Ok(serde_json::json!({"deleted": true}));
        }
        let body: Value = resp.into_json().map_err(|e| format!("JSON 解析失败: {}", e))?;
        Self::check_response(body)
    }

    fn check_response(body: Value) -> Result<Value, String> {
        if let Some(status) = body.get("status").and_then(|s| s.as_str()) {
            if status == "fail" {
                let msg = body
                    .get("message")
                    .or_else(|| body.get("reason"))
                    .and_then(|m| m.as_str())
                    .unwrap_or("未知错误");
                return Err(format!("禅道 API 错误: {}", msg));
            }
        }
        // Extract data field if present (format: { status, data: [...] })
        if let Some(data) = body.get("data") {
            if data.is_null() {
                return Ok(serde_json::json!(null));
            }
            return Ok(data.clone());
        }
        // Try entity-specific array keys (format: { status, <entity>s: [...] })
        for key in &["executions", "tasks", "stories", "bugs", "testcases", "users", "products", "projects", "programs", "builds", "releases", "plans", "requirements", "epics", "testtasks", "feedbacks", "files", "systems", "tickets"] {
            if let Some(items) = body.get(*key) {
                return Ok(items.clone());
            }
        }
        // Also try single entity keys (format: { status, <entity>: {...} })
        for key in &["execution", "task", "story", "bug", "testcase", "user", "product", "project", "program", "build", "release", "plan", "requirement", "epic", "testtask", "feedback", "file", "system", "ticket"] {
            if let Some(item) = body.get(*key) {
                return Ok(item.clone());
            }
        }
        // Return the full body as a fallback (for simple responses like { status, id })
        Ok(body)
    }
}

/// Generate a random boundary string for multipart requests.
fn rand_boundary() -> u128 {
    use std::time::{SystemTime, UNIX_EPOCH};
    let ts = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_nanos();
    // Mix in some pointer address for extra entropy
    ts.wrapping_mul(6364136223846793005).wrapping_add(1442695040888963407)
}

/// Build a multipart/form-data body containing text fields and one file.
/// NOTE: This is kept as a reference but not currently used. The curl-based
/// `post_multipart_curl` is used instead for file uploads.
use std::fs;
use std::path::Path;
/// `fields` is a list of (field_name, value) pairs.
/// `file_field` is the form field name for the file.
/// `file_path` is the path to the file to upload.
/// `file_name` is an optional override for the filename in the Content-Disposition.
fn build_multipart_body(
    boundary: &str,
    fields: &[(&str, &str)],
    file_field: &str,
    file_path: &str,
    file_name: Option<&str>,
) -> Result<Vec<u8>, String> {
    use std::fs;
    use std::path::Path;

    let dash_boundary = format!("--{boundary}");
    let crlf = "\r\n";

    let mut body = Vec::new();

    // Text fields
    for (name, value) in fields {
        body.extend_from_slice(dash_boundary.as_bytes());
        body.extend_from_slice(crlf.as_bytes());
        body.extend_from_slice(
            format!("Content-Disposition: form-data; name=\"{name}\"{crlf}")
                .as_bytes(),
        );
        body.extend_from_slice(crlf.as_bytes());
        body.extend_from_slice(value.as_bytes());
        body.extend_from_slice(crlf.as_bytes());
    }

    // File field
    let file_bytes = fs::read(file_path)
        .map_err(|e| format!("无法读取文件 {file_path}: {e}"))?;
    let actual_file_name = file_name
        .map(|s| s.to_string())
        .unwrap_or_else(|| {
            Path::new(file_path)
                .file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("file")
                .to_string()
        });

    body.extend_from_slice(dash_boundary.as_bytes());
    body.extend_from_slice(crlf.as_bytes());
    body.extend_from_slice(
        format!(
            "Content-Disposition: form-data; name=\"{file_field}\"; filename=\"{actual_file_name}\"{crlf}"
        )
        .as_bytes(),
    );
    body.extend_from_slice(b"Content-Type: application/octet-stream");
    body.extend_from_slice(crlf.as_bytes());
    body.extend_from_slice(crlf.as_bytes());
    body.extend_from_slice(&file_bytes);
    body.extend_from_slice(crlf.as_bytes());

    // Closing boundary
    body.extend_from_slice(format!("{dash_boundary}--{crlf}").as_bytes());

    Ok(body)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_build_url() {
        let auth = Rc::new(RefCell::new(AuthManager::new(
            "test".to_string(),
            "test".to_string(),
        )));
        let client = AuthenticatedClient {
            client: Client {
                base_url: "https://zentao.example.com".to_string(),
            },
            auth,
            token: "test-token".to_string(),
        };
        let url = client.build_url("/users");
        assert_eq!(url, "https://zentao.example.com/api.php/v2/users");
    }

    #[test]
    fn test_check_response_ok() {
        let body = serde_json::json!({
            "status": "success",
            "data": {"id": 1, "name": "test"}
        });
        let result = AuthenticatedClient::check_response(body);
        assert!(result.is_ok());
        assert_eq!(result.unwrap()["id"], 1);
    }

    #[test]
    fn test_check_response_data_null() {
        let body = serde_json::json!({
            "status": "success",
            "data": null
        });
        let result = AuthenticatedClient::check_response(body);
        assert!(result.is_ok());
        assert!(result.unwrap().is_null());
    }

    #[test]
    fn test_check_response_fail() {
        let body = serde_json::json!({
            "status": "fail",
            "message": "登录失败"
        });
        let result = AuthenticatedClient::check_response(body);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("登录失败"));
    }
}
