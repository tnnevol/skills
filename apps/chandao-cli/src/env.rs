//! Environment configuration loader.
//!
//! Loads CHANDAO_URL, CHANDAO_ACCOUNT, CHANDAO_PASSWORD from .env file or environment variables.

use dotenvy::dotenv;
use std::env;

#[derive(Debug)]
pub struct Config {
    pub base_url: String,
    pub account: String,
    pub password: String,
}

impl Config {
    pub fn load() -> Result<Self, String> {
        let _ = dotenv();

        let base_url =
            env::var("CHANDAO_URL").map_err(|_| {
                "[CONFIG_MISSING] 缺少 CHANDAO_URL\n请设置环境变量或在 .env 文件中配置"
                    .to_string()
            })?;

        let account =
            env::var("CHANDAO_ACCOUNT").map_err(|_| {
                "[CONFIG_MISSING] 缺少 CHANDAO_ACCOUNT\n请设置环境变量或在 .env 文件中配置"
                    .to_string()
            })?;

        let password =
            env::var("CHANDAO_PASSWORD").map_err(|_| {
                "[CONFIG_MISSING] 缺少 CHANDAO_PASSWORD\n请设置环境变量或在 .env 文件中配置"
                    .to_string()
            })?;

        Ok(Config {
            base_url: base_url.trim_end_matches('/').to_string(),
            account,
            password,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_config_trim_trailing_slash() {
        // Only test trimming when env vars exist
        if let (Ok(url), Ok(acct), Ok(pass)) = (
            env::var("CHANDAO_URL"),
            env::var("CHANDAO_ACCOUNT"),
            env::var("CHANDAO_PASSWORD"),
        ) {
            let config = Config::load().unwrap();
            assert!(!config.base_url.ends_with('/'));
            assert_eq!(config.account, acct);
            assert_eq!(config.password, pass);
        }
    }
}
