//! Environment configuration loading.

/// Halo API configuration.
pub struct Config {
    pub base_url: String,
    pub pat: String,
}

impl Config {
    /// Load config from env vars, falling back to .env files.
    pub fn load() -> Result<Self, String> {
        // Try loading .env from skill directory or project root
        let _ = dotenvy::dotenv();

        let base_url = std::env::var("HALO_BASE_URL")
            .map_err(|_| "HALO_BASE_URL 未设置，请配置环境变量或创建 .env 文件")?;

        let pat = std::env::var("HALO_PAT")
            .map_err(|_| "HALO_PAT 未设置，请配置环境变量或创建 .env 文件")?;

        Ok(Self {
            base_url: base_url.trim_end_matches('/').to_string(),
            pat,
        })
    }
}
