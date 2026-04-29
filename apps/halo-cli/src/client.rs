//! HTTP API client for Halo CMS.
use serde_json::Value;
use std::io::Read;

const EXT_POSTS_API: &str = "/apis/content.halo.run/v1alpha1/posts";
const CONSOLE_POSTS_API: &str = "/apis/api.console.halo.run/v1alpha1/posts";

/// API client for Halo CMS.
pub struct Client {
    pub base_url: String,
    pat: String,
}

/// API response wrapper.
pub struct ApiResponse {
    pub body: Vec<u8>,
    pub status: u16,
}

impl Client {
    pub fn new(base_url: String, pat: String) -> Self {
        Self {
            base_url: base_url.trim_end_matches('/').to_string(),
            pat,
        }
    }

    fn auth_header(&self) -> String {
        format!("Bearer {}", self.pat)
    }

    /// Execute an API request.
    pub fn do_request(
        &self,
        method: &str,
        path: &str,
        body: Option<&Value>,
    ) -> Result<ApiResponse, String> {
        let url = format!("{}{}", self.base_url, path);

        let resp = if let Some(b) = body {
            let req = match method {
                "POST" => ureq::post(&url),
                "PUT" => ureq::put(&url),
                "PATCH" => ureq::patch(&url),
                "DELETE" => ureq::delete(&url),
                _ => ureq::get(&url),
            };
            let json_bytes = serde_json::to_vec(b).map_err(|e| format!("序列化请求体失败: {}", e))?;
            req.set("Authorization", &self.auth_header())
               .set("Content-Type", "application/json")
               .send_bytes(&json_bytes)
               .map_err(|e| format!("请求失败: {}", e))?
        } else {
            let req = match method {
                "POST" => ureq::post(&url),
                "PUT" => ureq::put(&url),
                "PATCH" => ureq::patch(&url),
                "DELETE" => ureq::delete(&url),
                _ => ureq::get(&url),
            };
            req.set("Authorization", &self.auth_header())
               .call()
               .map_err(|e| format!("请求失败: {}", e))?
        };

        let status = resp.status();
        let body = resp.into_reader().bytes().collect::<Result<Vec<_>, _>>()
            .map_err(|e| format!("读取响应失败: {}", e))?;

        if status >= 400 {
            let err_msg = String::from_utf8_lossy(&body);
            return Err(format!("API 返回 {} — {}", status, err_msg));
        }

        Ok(ApiResponse { body, status })
    }

    /// API path constants.
    pub fn ext_posts_api(&self) -> &str {
        EXT_POSTS_API
    }

    pub fn console_posts_api(&self) -> &str {
        CONSOLE_POSTS_API
    }
}
