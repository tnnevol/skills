//! Token authentication module for 禅道 API v2.
//!
//! POST /api.php/v2/users/login → returns token
//! Token cached in memory, auto-refreshed on 401

#[derive(Clone)]
pub struct AuthManager {
    pub account: String,
    pub password: String,
    token: Option<String>,
}

impl AuthManager {
    pub fn new(account: String, password: String) -> Self {
        AuthManager {
            account,
            password,
            token: None,
        }
    }

    fn login(&self, base_url: &str) -> Result<String, String> {
        let url = format!("{}/api.php/v2/users/login", base_url);
        let body = serde_json::json!({
            "account": self.account,
            "password": self.password
        });

        let resp = ureq::post(&url)
            .set("Content-Type", "application/json")
            .send_json(&body)
            .map_err(|e| format!("登录请求失败: {}", e))?;

        let result: serde_json::Value = resp
            .into_json()
            .map_err(|e| format!("JSON 解析失败: {}", e))?;

        if let Some(data) = result.get("data") {
            if let Some(token) = data.get("token").and_then(|t| t.as_str()) {
                return Ok(token.to_string());
            }
        }

        let msg = result
            .get("message")
            .or_else(|| result.get("reason"))
            .and_then(|m| m.as_str())
            .unwrap_or("登录失败");
        Err(format!("禅道登录失败: {}", msg))
    }

    pub fn get_token(&mut self, base_url: &str) -> Result<String, String> {
        if let Some(ref token) = self.token {
            return Ok(token.clone());
        }
        let token = self.login(base_url)?;
        self.token = Some(token.clone());
        Ok(token)
    }

    pub fn refresh_token(&mut self, base_url: &str) -> Result<String, String> {
        self.token = None;
        self.get_token(base_url)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_new_auth_manager() {
        let auth = AuthManager::new("user".to_string(), "pass".to_string());
        assert_eq!(auth.account, "user");
        assert_eq!(auth.password, "pass");
        assert!(auth.token.is_none());
    }

    #[test]
    fn test_refresh_clears_cache() {
        let mut auth = AuthManager::new("user".to_string(), "pass".to_string());
        auth.token = Some("cached-token".to_string());
        assert_eq!(auth.token.as_deref(), Some("cached-token"));

        // refresh_token will try to login (will fail since no server), but cache is cleared
        let _ = auth.refresh_token("https://localhost:9999");
        assert!(auth.token.is_none());
    }
}
