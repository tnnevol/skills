//! Token authentication module for 禅道 API v2.
//!
//! POST /api.php/v2/users/login → returns token
//! Token cached in file (.chandao-cache/token.json) and memory
//! Auto-refreshed on 401

use std::fs;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};

/// Cached token data structure
#[derive(Serialize, Deserialize)]
struct TokenCache {
    token: String,
    base_url: String,
    account: String,
}

pub struct AuthManager {
    pub account: String,
    password: String,
    token: Option<String>,
    cache_path: PathBuf,
}

impl AuthManager {
    pub fn new(account: String, password: String) -> Self {
        let cache_path = Self::get_cache_path();
        let mut auth = AuthManager {
            account,
            password,
            token: None,
            cache_path,
        };
        // Try to load cached token on creation
        auth.load_cached_token();
        auth
    }

    /// Get the cache file path: {current_exe_dir}/.chandao-cache/token.json
    fn get_cache_path() -> PathBuf {
        let exe_dir = std::env::current_exe()
            .ok()
            .and_then(|p| p.parent().map(|d| d.to_path_buf()))
            .unwrap_or_else(|| PathBuf::from("."));
        exe_dir.join(".chandao-cache").join("token.json")
    }

    /// Load token from cache file if valid
    fn load_cached_token(&mut self) {
        if !self.cache_path.exists() {
            return;
        }

        let data = match fs::read_to_string(&self.cache_path) {
            Ok(d) => d,
            Err(_) => return,
        };

        let cache: TokenCache = match serde_json::from_str(&data) {
            Ok(c) => c,
            Err(_) => return,
        };

        // Check if cache matches current config
        if cache.account != self.account || cache.base_url.is_empty() {
            return;
        }

        self.token = Some(cache.token);
    }

    /// Save token to cache file
    fn save_cached_token(&self, base_url: &str) {
        if let Some(ref token) = self.token {
            let cache = TokenCache {
                token: token.clone(),
                base_url: base_url.to_string(),
                account: self.account.clone(),
            };

            if let Some(parent) = self.cache_path.parent() {
                let _ = fs::create_dir_all(parent);
            }

            if let Ok(data) = serde_json::to_string(&cache) {
                let _ = fs::write(&self.cache_path, data);
            }
        }
    }

    /// Clear cached token (file and memory)
    fn clear_cache(&mut self) {
        self.token = None;
        let _ = fs::remove_file(&self.cache_path);
    }

    fn login(&mut self, base_url: &str) -> Result<String, String> {
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

        if let Some(token) = result.get("token").and_then(|t| t.as_str()) {
            self.token = Some(token.to_string());
            self.save_cached_token(base_url);
            return Ok(token.to_string());
        }
        // Also try data.token format
        if let Some(data) = result.get("data") {
            if let Some(token) = data.get("token").and_then(|t| t.as_str()) {
                self.token = Some(token.to_string());
                self.save_cached_token(base_url);
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
        self.login(base_url)
    }

    pub fn refresh_token(&mut self, base_url: &str) -> Result<String, String> {
        self.clear_cache();
        self.login(base_url)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_new_auth_manager() {
        let auth = AuthManager::new("user".to_string(), "pass".to_string());
        assert_eq!(auth.account, "user");
        assert!(auth.token.is_none());
    }

    #[test]
    fn test_cache_path() {
        let path = AuthManager::get_cache_path();
        assert!(path.ends_with(".chandao-cache/token.json"));
    }
}
