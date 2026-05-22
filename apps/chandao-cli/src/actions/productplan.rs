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
pub enum ProductplanCommands {
    /// List product plans (requires --product)
    List {
        /// Product ID
        #[arg(short = 'p', long)]
        product: i64,
        /// Page number
        #[arg(short = 'g', long, default_value = "1")]
        page: u32,
        /// Records per page
        #[arg(short = 'n', long, default_value = "20")]
        limit: u32,
    },
    /// List product plans by product
    ListByProduct {
        /// Product ID
        #[arg(short, long)]
        product: i64,
        /// Page number
        #[arg(short = 'g', long, default_value = "1")]
        page: u32,
        /// Records per page
        #[arg(short = 'n', long, default_value = "20")]
        limit: u32,
    },
    /// Get plan details
    Get {
        /// Plan ID
        id: i64,
    },
    /// Create a plan
    Create {
        /// Product ID (required)
        #[arg(short, long)]
        product: i64,
        /// Plan title (required)
        #[arg(short, long)]
        title: String,
        /// Description
        #[arg(short, long)]
        desc: Option<String>,
        /// Begin date (YYYY-MM-DD)
        #[arg(long)]
        begin: Option<String>,
        /// End date (YYYY-MM-DD)
        #[arg(long)]
        end: Option<String>,
        /// Dry run
        #[arg(long)]
        dry_run: bool,
    },
    /// Update a plan
    Update {
        /// Plan ID
        id: i64,
        /// Plan title
        #[arg(short, long)]
        title: Option<String>,
        /// Description
        #[arg(short, long)]
        desc: Option<String>,
        /// Begin date (YYYY-MM-DD)
        #[arg(long)]
        begin: Option<String>,
        /// End date (YYYY-MM-DD)
        #[arg(long)]
        end: Option<String>,
        /// Dry run
        #[arg(long)]
        dry_run: bool,
    },
    /// Delete a plan
    Delete {
        /// Plan ID
        id: i64,
        /// Skip confirmation
        #[arg(long)]
        yes: bool,
        /// Dry run
        #[arg(long)]
        dry_run: bool,
    },
}


pub fn handle_productplan(
    client: &Client,
    auth: &Rc<RefCell<AuthManager>>,
    cmd: &ProductplanCommands,
) -> Result<(), String> {
    match cmd {
        ProductplanCommands::List { product, page, limit }
        | ProductplanCommands::ListByProduct { product, page, limit } => {
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let data = ac.get(&format!(
                    "/products/{}/productplans?pageID={}&recPerPage={}",
                    product, page, limit
                ))?;
                utils::print_table(
                    &data,
                    &["id", "title", "parent", "begin", "end", "status"],
                );
                Ok(())
            })
        }
        ProductplanCommands::Get { id } => {
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let data = ac.get(&format!("/productplans/{}", id))?;
                utils::print_json(&data);
                Ok(())
            })
        }
        ProductplanCommands::Create {
            product,
            title,
            desc,
            begin,
            end,
            dry_run,
        } => {
            if *dry_run {
                println!(
                    "🔍 [DRY-RUN] 创建产品计划: title={}, product={}",
                    title, product
                );
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({
                    "productID": product,
                    "title": title,
                });
                if let Some(v) = desc {
                    body["desc"] = json!(v);
                }
                if let Some(v) = begin {
                    body["begin"] = json!(v);
                }
                if let Some(v) = end {
                    body["end"] = json!(v);
                }
                let result = ac.post("/productplans", &body)?;
                println!("✅ 产品计划创建成功");
                utils::print_json(&result);
                Ok(())
            })
        }
        ProductplanCommands::Update {
            id,
            title,
            desc,
            begin,
            end,
            dry_run,
        } => {
            if *dry_run {
                println!("🔍 [DRY-RUN] 更新产品计划 #{}", id);
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({});
                if let Some(v) = title {
                    body["title"] = json!(v);
                }
                if let Some(v) = desc {
                    body["desc"] = json!(v);
                }
                if let Some(v) = begin {
                    body["begin"] = json!(v);
                }
                if let Some(v) = end {
                    body["end"] = json!(v);
                }
                let result = ac.put(&format!("/productplans/{}", id), &body)?;
                println!("✅ 产品计划 #{} 更新成功", id);
                utils::print_json(&result);
                Ok(())
            })
        }
        ProductplanCommands::Delete { id, yes, dry_run } => {
            if !yes && !*dry_run {
                println!("⚠️  确认删除产品计划 #{}? 使用 --yes 确认", id);
                return Ok(());
            }
            if *dry_run {
                println!("🔍 [DRY-RUN] 删除产品计划 #{}", id);
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let result = ac.delete(&format!("/productplans/{}", id))?;
                println!("✅ 产品计划 #{} 已删除", id);
                utils::print_json(&result);
                Ok(())
            })
        }
    }
}

