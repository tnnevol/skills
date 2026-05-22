use clap::Subcommand;
use serde_json::json;
use std::cell::RefCell;
use std::rc::Rc;

use crate::markdown::markdown_to_html;
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
pub enum RequirementCommands {
    /// List requirements (requires --product)
    List {
        /// Product ID
        #[arg(short = 'p', long)]
        product: i64,
        /// Browse type (allstory, assignedtome, openedbyme, reviewedbyme, draftstory)
        #[arg(short = 'b', long, default_value = "allstory")]
        browse: String,
        /// Page number
        #[arg(short = 'g', long, default_value = "1")]
        page: u32,
        /// Records per page
        #[arg(short = 'n', long, default_value = "20")]
        limit: u32,
    },
    /// List requirements by product
    ListByProduct {
        /// Product ID
        #[arg(short = 'p', long)]
        product: i64,
        /// Browse type (allstory, assignedtome, openedbyme, reviewedbyme, draftstory)
        #[arg(short = 'b', long, default_value = "allstory")]
        browse: String,
        /// Page number
        #[arg(short = 'g', long, default_value = "1")]
        page: u32,
        /// Records per page
        #[arg(short = 'n', long, default_value = "20")]
        limit: u32,
    },
    /// Get requirement details
    Get {
        /// Requirement ID
        id: i64,
    },
    /// Create a requirement
    Create {
        /// Product ID
        #[arg(short = 'p', long)]
        product: i64,
        /// Title
        #[arg(short, long)]
        title: String,
        /// Specification
        #[arg(short, long)]
        spec: Option<String>,
        /// Verification criteria
        #[arg(long)]
        verify: Option<String>,
        /// Module ID
        #[arg(short = 'm', long)]
        module: Option<i64>,
        /// Priority (1-4)
        #[arg(short = 'i', long)]
        pri: Option<u8>,
        /// Source
        #[arg(short = 'o', long)]
        source: Option<String>,
        /// Assigned to
        #[arg(short = 'a', long)]
        assigned: Option<String>,
        /// Estimate (hours)
        #[arg(long)]
        estimate: Option<f64>,
        /// Dry run
        #[arg(long)]
        dry_run: bool,
    },
    /// Update a requirement
    Update {
        /// Requirement ID
        id: i64,
        #[arg(short, long)]
        title: Option<String>,
        #[arg(short, long)]
        desc: Option<String>,
        #[arg(short = 'm', long)]
        module: Option<i64>,
        #[arg(short = 'i', long)]
        pri: Option<u8>,
        #[arg(short = 'a', long)]
        assigned: Option<String>,
        #[arg(short, long)]
        status: Option<String>,
        #[arg(long)]
        dry_run: bool,
    },
    /// Change a requirement (submit for review)
    Change {
        /// Requirement ID
        id: i64,
        /// Reviewers (comma-separated)
        #[arg(short, long, value_delimiter = ',', required = true)]
        reviewer: Vec<String>,
        /// New title
        #[arg(short, long)]
        title: Option<String>,
        /// New specification
        #[arg(long)]
        spec: Option<String>,
        /// New verification criteria
        #[arg(long)]
        verify: Option<String>,
        #[arg(long)]
        dry_run: bool,
    },
    /// Close a requirement
    Close {
        id: i64,
        /// Reason: done, duplicate, postponed, willnotfix, bydesign
        #[arg(short, long)]
        reason: String,
        #[arg(long)]
        dry_run: bool,
    },
    /// Activate a closed requirement
    Activate {
        id: i64,
        #[arg(long)]
        dry_run: bool,
    },
    /// Delete a requirement
    Delete {
        id: i64,
        #[arg(long)]
        yes: bool,
        #[arg(long)]
        dry_run: bool,
    },
}


pub fn handle_requirement(
    client: &Client,
    auth: &Rc<RefCell<AuthManager>>,
    cmd: &RequirementCommands,
) -> Result<(), String> {
    match cmd {
        RequirementCommands::List { product, browse, page, limit }
        | RequirementCommands::ListByProduct { product, browse, page, limit } => with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
            let data = ac.get(&format!(
                "/products/{}/requirements?browse={}&pageID={}&recPerPage={}",
                product, browse, page, limit
            ))?;
            utils::print_table(
                &data,
                &["id", "title", "status", "pri", "assignedTo", "openedDate"],
            );
            Ok(())
        }),
        RequirementCommands::Get { id } => {
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let data = ac.get(&format!("/requirements/{}", id))?;
                utils::print_json(&data);
                Ok(())
            })
        }
        RequirementCommands::Create {
            product,
            title,
            spec,
            verify,
            module,
            pri,
            source,
            assigned,
            estimate,
            dry_run,
        } => {
            if *dry_run {
                println!(
                    "🔍 [DRY-RUN] 创建用户需求: title={}, product={}",
                    title, product
                );
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({
                    "productID": product,
                    "title": title,
                });
                if let Some(v) = spec {
                    body["spec"] = json!(markdown_to_html(&v));
                }
                if let Some(v) = verify {
                    body["verify"] = json!(markdown_to_html(&v));
                }
                if let Some(m) = module {
                    body["module"] = json!(m);
                }
                if let Some(p) = pri {
                    body["pri"] = json!(p);
                }
                if let Some(s) = source {
                    body["source"] = json!(s);
                }
                if let Some(a) = assigned {
                    body["assignedTo"] = json!(a);
                }
                if let Some(e) = estimate {
                    body["estimate"] = json!(e);
                }
                let result = ac.post("/requirements", &body)?;
                println!("✅ 用户需求创建成功");
                utils::print_json(&result);
                Ok(())
            })
        }
        RequirementCommands::Update {
            id,
            title,
            desc,
            module,
            pri,
            assigned,
            status,
            dry_run,
        } => {
            if *dry_run {
                println!("🔍 [DRY-RUN] 更新用户需求 #{}", id);
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
                if let Some(m) = module {
                    body["module"] = json!(m);
                }
                if let Some(p) = pri {
                    body["pri"] = json!(p);
                }
                if let Some(a) = assigned {
                    body["assignedTo"] = json!(a);
                }
                if let Some(s) = status {
                    body["status"] = json!(s);
                }
                let result = ac.put(&format!("/requirements/{}", id), &body)?;
                println!("✅ 用户需求 #{} 更新成功", id);
                utils::print_json(&result);
                Ok(())
            })
        }
        RequirementCommands::Change {
            id,
            reviewer,
            title,
            spec,
            verify,
            dry_run,
        } => {
            if *dry_run {
                println!(
                    "🔍 [DRY-RUN] 变更用户需求 #{}: reviewer={:?}",
                    id, reviewer
                );
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({"reviewer": reviewer});
                if let Some(t) = title {
                    body["title"] = json!(t);
                }
                if let Some(s) = spec {
                    body["spec"] = json!(markdown_to_html(&s));
                }
                if let Some(v) = verify {
                    body["verify"] = json!(markdown_to_html(&v));
                }
                let result = ac.put(&format!("/requirements/{}/change", id), &body)?;
                println!("✅ 用户需求 #{} 已提交变更", id);
                utils::print_json(&result);
                Ok(())
            })
        }
        RequirementCommands::Close { id, reason, dry_run } => {
            if *dry_run {
                println!("🔍 [DRY-RUN] 关闭用户需求 #{}", id);
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let body = json!({"reason": reason});
                ac.put(&format!("/requirements/{}/close", id), &body)?;
                println!("✅ 用户需求 #{} 已关闭", id);
                Ok(())
            })
        }
        RequirementCommands::Activate { id, dry_run } => {
            if *dry_run {
                println!("🔍 [DRY-RUN] 激活用户需求 #{}", id);
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                ac.put(&format!("/requirements/{}/activate", id), &json!({}))?;
                println!("✅ 用户需求 #{} 已激活", id);
                Ok(())
            })
        }
        RequirementCommands::Delete { id, yes, dry_run } => {
            if !yes && !*dry_run {
                println!("⚠️  确认删除用户需求 #{}? 使用 --yes 确认", id);
                return Ok(());
            }
            if *dry_run {
                println!("🔍 [DRY-RUN] 删除用户需求 #{}", id);
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let result = ac.delete(&format!("/requirements/{}", id))?;
                println!("✅ 用户需求 #{} 已删除", id);
                utils::print_json(&result);
                Ok(())
            })
        }
    }
}

