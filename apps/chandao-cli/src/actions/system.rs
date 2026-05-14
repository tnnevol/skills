use clap::Subcommand;
use serde_json::json;
use std::cell::RefCell;
use std::rc::Rc;

use crate::utils;
use crate::auth::AuthManager;
use crate::client::{Client, AuthenticatedClient};

macro_rules! with_auth {
    ($client:expr, $auth:expr, $body:expr) => {{
        let mut ac = $client.authenticate($auth)?;
        $body(&mut ac)
    }};
}



#[derive(Subcommand)]
pub enum SystemCommands {
    /// List systems for a product
    List {
        /// Product ID
        #[arg(short, long)]
        product: i32,
        /// Page number
        #[arg(short = 'g', long, default_value = "1")]
        page: u32,
        /// Records per page
        #[arg(short = 'r', long, default_value = "20")]
        limit: u32,
    },
    /// Get system details
    Get {
        /// System ID
        id: i32,
    },
    /// Create a new system
    Create {
        /// Product ID
        #[arg(short = 'p', long)]
        product: i64,
        /// System name (required)
        #[arg(long)]
        name: String,
        /// System code
        #[arg(long)]
        code: Option<String>,
        /// System key
        #[arg(long)]
        key: Option<String>,
        /// Description
        #[arg(long)]
        desc: Option<String>,
        /// System type
        #[arg(long)]
        r#type: Option<String>,
        /// Dry run
        #[arg(long)]
        dry_run: bool,
    },
    /// Update a system
    Update {
        /// System ID
        id: i32,
        /// System name
        #[arg(long)]
        name: Option<String>,
        /// System key
        #[arg(long)]
        key: Option<String>,
        /// Description
        #[arg(long)]
        desc: Option<String>,
        /// System type
        #[arg(long)]
        r#type: Option<String>,
        /// Dry run
        #[arg(long)]
        dry_run: bool,
    },
}


pub fn handle_system(
    client: &Client,
    auth: &Rc<RefCell<AuthManager>>,
    cmd: &SystemCommands,
) -> Result<(), String> {
    match cmd {
        SystemCommands::List {
            product,
            page,
            limit,
        } => {
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let data = ac.get(&format!(
                    "/products/{}/systems?pageID={}&recPerPage={}",
                    product, page, limit
                ))?;
                utils::print_table(&data, &["id", "name", "code", "type", "desc"]);
                Ok(())
            })
        }
        SystemCommands::Get { id } => {
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let data = ac.get(&format!("/systems/{}", id))?;
                utils::print_json(&data);
                Ok(())
            })
        }
        SystemCommands::Create {
            product,
            name,
            code,
            key,
            desc,
            r#type,
            dry_run,
        } => {
            if *dry_run {
                println!("🔍 [DRY-RUN] 创建系统: name={}", name);
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({"name": name, "productID": product});
                if let Some(c) = code {
                    body["code"] = json!(c);
                }
                if let Some(k) = key {
                    body["key"] = json!(k);
                }
                if let Some(d) = desc {
                    body["desc"] = json!(d);
                }
                if let Some(t) = r#type {
                    body["type"] = json!(t);
                }
                let result = ac.post("/systems", &body)?;
                println!("✅ 系统创建成功");
                utils::print_json(&result);
                Ok(())
            })
        }
        SystemCommands::Update {
            id,
            name,
            key,
            desc,
            r#type,
            dry_run,
        } => {
            if *dry_run {
                println!("🔍 [DRY-RUN] 更新系统 #{}", id);
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({});
                if let Some(n) = name {
                    body["name"] = json!(n);
                }
                if let Some(k) = key {
                    body["key"] = json!(k);
                }
                if let Some(d) = desc {
                    body["desc"] = json!(d);
                }
                if let Some(t) = r#type {
                    body["type"] = json!(t);
                }
                let result = ac.put(&format!("/systems/{}", id), &body)?;
                println!("✅ 系统 #{} 更新成功", id);
                utils::print_json(&result);
                Ok(())
            })
        }
    }
}

