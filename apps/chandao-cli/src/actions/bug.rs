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
pub enum BugCommands {
    /// List bugs
    List {
        /// Product ID
        #[arg(short = 'p', long)]
        product: Option<i64>,
        /// Project ID
        #[arg(short = 'j', long)]
        project: Option<i64>,
        /// Execution ID (list bugs for a specific execution)
        #[arg(short = 'e', long)]
        execution: Option<i64>,
        /// Page
        #[arg(short = 'g', long, default_value = "1")]
        page: u32,
        /// Limit
        #[arg(short = 'n', long, default_value = "20")]
        limit: u32,
    },
    /// Get bug
    Get { id: i64 },
    /// Create bug
    Create {
        /// Product ID
        #[arg(short = 'p', long)]
        product: i64,
        /// Bug title
        #[arg(short, long)]
        title: String,
        /// Assigned to
        #[arg(short = 'a', long)]
        assigned: Option<String>,
        /// Priority (1-4)
        #[arg(short = 'i', long)]
        pri: Option<u8>,
        /// Severity (1-4)
        #[arg(short = 's', long)]
        severity: Option<u8>,
        /// Type (codeerror/config/install/security/performance/standard/automation/designdefect/others)
        #[arg(short = 'y', long, default_value = "codeerror")]
        r#type: String,
        /// Opened build (默认 trunk)
        #[arg(short = 'b', long, default_value = "trunk")]
        opened_build: String,
        /// Steps to reproduce
        #[arg(short = 'd', long)]
        desc: Option<String>,
        /// Module ID
        #[arg(short = 'm', long)]
        module: Option<i64>,
        /// Execution ID
        #[arg(short = 'e', long)]
        execution: Option<i64>,
        /// Task ID
        #[arg(long)]
        task: Option<i64>,
        /// Story ID
        #[arg(long)]
        story: Option<i64>,
        /// OS
        #[arg(long)]
        os: Option<String>,
        /// Browser
        #[arg(long)]
        browser: Option<String>,
        /// Dry run
        #[arg(long)]
        dry_run: bool,
    },
    /// Update bug
    Update {
        id: i64,
        #[arg(short, long)]
        title: Option<String>,
        #[arg(short = 'a', long)]
        assigned: Option<String>,
        #[arg(short, long)]
        status: Option<String>,
        #[arg(short = 'i', long)]
        pri: Option<u8>,
        /// Execution ID (关联到执行)
        #[arg(short = 'e', long)]
        execution: Option<i64>,
        #[arg(long)]
        dry_run: bool,
    },
    /// Resolve a bug
    Resolve {
        id: i64,
        /// Resolution: fixed, postponed, bydesign, willnotfix, duplicate, external
        #[arg(short, long)]
        resolution: String,
        #[arg(short, long)]
        comment: Option<String>,
        /// Resolved date
        #[arg(long)]
        resolved_date: Option<String>,
        /// Resolved build
        #[arg(long)]
        resolved_build: Option<String>,
        /// Assigned to
        #[arg(short = 'a', long)]
        assigned_to: Option<String>,
        #[arg(long)]
        dry_run: bool,
    },
    /// Close a bug
    Close {
        id: i64,
        #[arg(short, long)]
        comment: Option<String>,
        #[arg(long)]
        dry_run: bool,
    },
    /// Activate a bug
    Activate {
        id: i64,
        #[arg(short, long)]
        comment: Option<String>,
        #[arg(long)]
        dry_run: bool,
    },
    /// Delete bug
    Delete {
        id: i64,
        #[arg(long)]
        yes: bool,
        #[arg(long)]
        dry_run: bool,
    },
}


pub fn handle_bug(
    client: &Client,
    auth: &Rc<RefCell<AuthManager>>,
    cmd: &BugCommands,
) -> Result<(), String> {
    match cmd {
        BugCommands::List { product, project, execution, page, limit } => with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
            let path = if let Some(e) = execution {
                format!("/executions/{}/bugs?pageID={}&recPerPage={}", e, page, limit)
            } else if let Some(j) = project {
                format!("/projects/{}/bugs?pageID={}&recPerPage={}", j, page, limit)
            } else if let Some(p) = product {
                format!("/products/{}/bugs?pageID={}&recPerPage={}", p, page, limit)
            } else {
                format!("/bugs?pageID={}&recPerPage={}", page, limit)
            };
            let data = ac.get(&path)?;
            utils::print_table(&data, &["id", "title", "status", "severity", "pri", "assignedTo"]);
            Ok(())
        }),
        BugCommands::Get { id } => with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
            let data = ac.get(&format!("/bugs/{}", id))?;
            utils::print_json(&data);
            Ok(())
        }),
        BugCommands::Create { product, title, assigned, pri, severity, r#type, opened_build, desc, module, execution, task, story, os, browser, dry_run } => {
            if *dry_run { println!("🔍 [DRY-RUN] 创建Bug: {}", title); return Ok(()); }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({"productID": product, "title": title, "type": r#type, "openedBuild": [opened_build]});
                if let Some(a) = assigned { body["assignedTo"] = json!(a); }
                if let Some(p) = pri { body["pri"] = json!(p); }
                if let Some(s) = severity { body["severity"] = json!(s); }
                if let Some(d) = desc { body["steps"] = json!(d); }
                if let Some(m) = module { body["module"] = json!(m); }
                if let Some(e) = execution { body["execution"] = json!(e); }
                if let Some(t) = task { body["task"] = json!(t); }
                if let Some(s) = story { body["story"] = json!(s); }
                if let Some(o) = os { body["os"] = json!(o); }
                if let Some(b) = browser { body["browser"] = json!(b); }
                let result = ac.post("/bugs", &body)?;
                println!("✅ Bug创建成功");
                utils::print_json(&result);
                Ok(())
            })
        }
        BugCommands::Update { id, title, assigned, status, pri, execution, dry_run } => {
            if *dry_run { println!("🔍 [DRY-RUN] 更新Bug #{}", id); return Ok(()); }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                // 如果指定了 status，使用专门的状态流转端点
                if let Some(s) = status {
                    match s.as_str() {
                        "resolved" => {
                            return Err("❌ Bug 状态不能通过 update 修改，请使用: bug resolve --resolution <type>".to_string());
                        }
                        "closed" => {
                            return Err("❌ Bug 状态不能通过 update 修改，请使用: bug close".to_string());
                        }
                        "active" => {
                            return Err("❌ Bug 状态不能通过 update 修改，请使用: bug activate".to_string());
                        }
                        _ => {
                            return Err(format!("❌ 无效的状态 '{}'，有效值: active, resolved, closed", s));
                        }
                    }
                }
                let mut body = json!({});
                if let Some(t) = title { body["title"] = json!(t); }
                if let Some(a) = assigned { body["assignedTo"] = json!(a); }
                if let Some(p) = pri { body["pri"] = json!(p); }
                if let Some(e) = execution { body["execution"] = json!(e); }
                let result = ac.put(&format!("/bugs/{}", id), &body)?;
                println!("✅ Bug #{} 更新成功", id);
                utils::print_json(&result);
                Ok(())
            })
        }
        BugCommands::Resolve { id, resolution, comment, resolved_date, resolved_build, assigned_to, dry_run } => {
            if *dry_run { println!("🔍 [DRY-RUN] 解决Bug #{}: {}", id, resolution); return Ok(()); }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({"resolution": resolution});
                if let Some(c) = comment { body["comment"] = json!(c); }
                if let Some(d) = resolved_date { body["resolvedDate"] = json!(d); }
                if let Some(b) = resolved_build { body["resolvedBuild"] = json!(b); }
                if let Some(a) = assigned_to { body["assignedTo"] = json!(a); }
                ac.put(&format!("/bugs/{}/resolve", id), &body)?;
                println!("✅ Bug #{} 已解决: {}", id, resolution);
                Ok(())
            })
        }
        BugCommands::Close { id, comment, dry_run } => {
            if *dry_run { println!("🔍 [DRY-RUN] 关闭Bug #{}", id); return Ok(()); }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({});
                if let Some(c) = comment { body["comment"] = json!(c); }
                ac.put(&format!("/bugs/{}/close", id), &body)?;
                println!("✅ Bug #{} 已关闭", id);
                Ok(())
            })
        }
        BugCommands::Activate { id, comment, dry_run } => {
            if *dry_run { println!("🔍 [DRY-RUN] 激活Bug #{}", id); return Ok(()); }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({});
                if let Some(c) = comment { body["comment"] = json!(c); }
                ac.put(&format!("/bugs/{}/activate", id), &body)?;
                println!("✅ Bug #{} 已激活", id);
                Ok(())
            })
        }
        BugCommands::Delete { id, yes, dry_run } => {
            if !yes && !dry_run { eprintln!("⚠️  确认删除Bug #{}？使用 --yes", id); return Ok(()); }
            if *dry_run { println!("🔍 [DRY-RUN] 删除Bug #{}", id); return Ok(()); }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                ac.delete(&format!("/bugs/{}", id))?;
                println!("✅ Bug #{} 已删除", id);
                Ok(())
            })
        }
    }
}

