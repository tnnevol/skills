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
pub enum ReleaseCommands {
    /// List releases by product
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
    /// List all releases (general list)
    List {
        /// Page number
        #[arg(short = 'g', long, default_value = "1")]
        page: u32,
        /// Records per page
        #[arg(short = 'n', long, default_value = "20")]
        limit: u32,
    },
    /// Create a release
    Create {
        /// Product ID (required)
        #[arg(short, long)]
        product: i64,
        /// Build ID (required)
        #[arg(short, long)]
        build: i64,
        /// Release name (required)
        #[arg(short, long)]
        name: String,
        /// Release date (YYYY-MM-DD)
        #[arg(long)]
        date: Option<String>,
        /// Released by
        #[arg(long)]
        released_by: Option<String>,
        /// Mailto (comma-separated accounts)
        #[arg(long, value_delimiter = ',')]
        mailto: Option<Vec<String>>,
        /// Notify subscribers
        #[arg(long)]
        notify: Option<bool>,
        /// Description
        #[arg(short, long)]
        desc: Option<String>,
        /// Link bugs (comma-separated IDs)
        #[arg(long, value_delimiter = ',')]
        link_bug: Option<Vec<i64>>,
        /// Link stories (comma-separated IDs)
        #[arg(long, value_delimiter = ',')]
        link_story: Option<Vec<i64>>,
        /// Dry run
        #[arg(long)]
        dry_run: bool,
    },
    /// Update a release
    Update {
        /// Release ID
        id: i64,
        /// Release name
        #[arg(short, long)]
        name: Option<String>,
        /// Description
        #[arg(short, long)]
        desc: Option<String>,
        /// Release status
        #[arg(short, long)]
        status: Option<String>,
        /// Release date (YYYY-MM-DD)
        #[arg(long)]
        date: Option<String>,
        /// Released by
        #[arg(long)]
        released_by: Option<String>,
        /// Mailto (comma-separated accounts)
        #[arg(long, value_delimiter = ',')]
        mailto: Option<Vec<String>>,
        /// Dry run
        #[arg(long)]
        dry_run: bool,
    },
    /// Delete a release
    Delete {
        /// Release ID
        id: i64,
        /// Skip confirmation
        #[arg(long)]
        yes: bool,
        /// Dry run
        #[arg(long)]
        dry_run: bool,
    },
}


pub fn handle_release(
    client: &Client,
    auth: &Rc<RefCell<AuthManager>>,
    cmd: &ReleaseCommands,
) -> Result<(), String> {
    match cmd {
        ReleaseCommands::ListByProduct {
            product,
            page,
            limit,
        } => {
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let data = ac.get(&format!(
                    "/products/{}/releases?pageID={}&recPerPage={}",
                    product, page, limit
                ))?;
                utils::print_table(
                    &data,
                    &[
                        "id",
                        "name",
                        "productName",
                        "buildName",
                        "status",
                        "date",
                        "desc",
                    ],
                );
                Ok(())
            })
        }
        ReleaseCommands::List { page, limit } => {
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let data = ac.get(&format!(
                    "/releases?pageID={}&recPerPage={}",
                    page, limit
                ))?;
                utils::print_table(
                    &data,
                    &[
                        "id",
                        "name",
                        "productName",
                        "buildName",
                        "status",
                        "date",
                        "desc",
                    ],
                );
                Ok(())
            })
        }
        ReleaseCommands::Create {
            product,
            build,
            name,
            date,
            released_by,
            mailto,
            notify,
            desc,
            link_bug,
            link_story,
            dry_run,
        } => {
            if *dry_run {
                println!(
                    "🔍 [DRY-RUN] 创建发布: name={}, product={}, build={}",
                    name, product, build
                );
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({
                    "productID": product,
                    "build": build,
                    "name": name,
                });
                if let Some(v) = date {
                    body["date"] = json!(v);
                }
                if let Some(v) = released_by {
                    body["releasedBy"] = json!(v);
                }
                if let Some(v) = mailto {
                    body["mailto"] = json!(v);
                }
                if let Some(v) = notify {
                    body["notify"] = json!(v);
                }
                if let Some(v) = desc {
                    body["desc"] = json!(v);
                }
                if let Some(v) = link_bug {
                    body["linkBug"] = json!(v);
                }
                if let Some(v) = link_story {
                    body["linkStory"] = json!(v);
                }
                let result = ac.post("/releases", &body)?;
                println!("✅ 发布创建成功");
                utils::print_json(&result);
                Ok(())
            })
        }
        ReleaseCommands::Update {
            id,
            name,
            desc,
            status,
            date,
            released_by,
            mailto,
            dry_run,
        } => {
            if *dry_run {
                println!("🔍 [DRY-RUN] 更新发布 #{}", id);
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({});
                if let Some(v) = name {
                    body["name"] = json!(v);
                }
                if let Some(v) = desc {
                    body["desc"] = json!(v);
                }
                if let Some(v) = status {
                    body["status"] = json!(v);
                }
                if let Some(v) = date {
                    body["date"] = json!(v);
                }
                if let Some(v) = released_by {
                    body["releasedBy"] = json!(v);
                }
                if let Some(v) = mailto {
                    body["mailto"] = json!(v);
                }
                let result = ac.put(&format!("/releases/{}", id), &body)?;
                println!("✅ 发布 #{} 更新成功", id);
                utils::print_json(&result);
                Ok(())
            })
        }
        ReleaseCommands::Delete { id, yes, dry_run } => {
            if !yes && !*dry_run {
                println!("⚠️  确认删除发布 #{}? 使用 --yes 确认", id);
                return Ok(());
            }
            if *dry_run {
                println!("🔍 [DRY-RUN] 删除发布 #{}", id);
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let result = ac.delete(&format!("/releases/{}", id))?;
                println!("✅ 发布 #{} 已删除", id);
                utils::print_json(&result);
                Ok(())
            })
        }
    }
}

