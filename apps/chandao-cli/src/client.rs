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
        let body: Value = resp.into_json().map_err(|e| format!("JSON 解析失败: {}", e))?;
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
        // Extract data field if present
        if let Some(data) = body.get("data") {
            if data.is_null() {
                return Ok(serde_json::json!(null));
            }
            return Ok(data.clone());
        }
        Ok(body)
    }
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
