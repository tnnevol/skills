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
pub enum ProgramCommands {
    /// List programs
    List {
        /// Browse type (all, unclosed, etc.)
        #[arg(short = 'b', long, default_value = "all")]
        browse_type: String,
        /// Order by field (e.g., id_desc, name_asc)
        #[arg(short = 'o', long, default_value = "id_desc")]
        order_by: String,
        /// Page number
        #[arg(short = 'g', long, default_value = "1")]
        page: u32,
        /// Records per page
        #[arg(short = 'n', long, default_value = "20")]
        limit: u32,
    },
    /// Get program details
    Get {
        /// Program ID
        id: i64,
    },
    /// Create a new program
    Create {
        /// Program name (required)
        #[arg(short, long)]
        name: String,
        /// Program code (required)
        #[arg(short, long)]
        code: String,
        /// Description
        #[arg(short, long)]
        desc: Option<String>,
        /// Status (wait, doing, suspended, closed)
        #[arg(short, long)]
        status: Option<String>,
        /// Parent program ID
        #[arg(short = 'p', long)]
        parent: Option<i64>,
        /// PM (project manager account)
        #[arg(long)]
        pm: Option<String>,
        /// Budget (hours)
        #[arg(long)]
        budget: Option<f64>,
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
    /// Update a program
    Update {
        /// Program ID
        id: i64,
        /// Program name
        #[arg(short, long)]
        name: Option<String>,
        /// Program code
        #[arg(short, long)]
        code: Option<String>,
        /// Description
        #[arg(short, long)]
        desc: Option<String>,
        /// Status
        #[arg(short, long)]
        status: Option<String>,
        /// Parent program ID
        #[arg(short = 'p', long)]
        parent: Option<i64>,
        /// PM (project manager account)
        #[arg(long)]
        pm: Option<String>,
        /// Budget (hours)
        #[arg(long)]
        budget: Option<f64>,
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
    /// Delete a program
    Delete {
        /// Program ID
        id: i64,
        /// Skip confirmation
        #[arg(long)]
        yes: bool,
        /// Dry run
        #[arg(long)]
        dry_run: bool,
    },
}


pub fn handle_program(
    client: &Client,
    auth: &Rc<RefCell<AuthManager>>,
    cmd: &ProgramCommands,
) -> Result<(), String> {
    match cmd {
        ProgramCommands::List {
            browse_type,
            order_by,
            page,
            limit,
        } => {
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let data = ac.get(&format!(
                    "/programs?browseType={}&orderBy={}&recPerPage={}&pageID={}",
                    browse_type, order_by, limit, page
                ))?;
                utils::print_table(
                    &data,
                    &["id", "name", "code", "status", "PM", "begin", "end"],
                );
                Ok(())
            })
        }
        ProgramCommands::Get { id } => {
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let data = ac.get(&format!("/programs/{}", id))?;
                utils::print_json(&data);
                Ok(())
            })
        }
        ProgramCommands::Create {
            name,
            code,
            desc,
            status,
            parent,
            pm,
            budget,
            begin,
            end,
            dry_run,
        } => {
            if *dry_run {
                println!(
                    "🔍 [DRY-RUN] 创建项目集: name={}, code={}",
                    name, code
                );
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({
                    "name": name,
                    "code": code,
                });
                if let Some(v) = desc {
                    body["desc"] = json!(v);
                }
                if let Some(v) = status {
                    body["status"] = json!(v);
                }
                if let Some(v) = parent {
                    body["parent"] = json!(v);
                }
                if let Some(v) = pm {
                    body["PM"] = json!(v);
                }
                if let Some(v) = budget {
                    body["budget"] = json!(v);
                }
                if let Some(v) = begin {
                    body["begin"] = json!(v);
                }
                if let Some(v) = end {
                    body["end"] = json!(v);
                }
                let result = ac.post("/programs", &body)?;
                println!("✅ 项目集创建成功");
                utils::print_json(&result);
                Ok(())
            })
        }
        ProgramCommands::Update {
            id,
            name,
            code,
            desc,
            status,
            parent,
            pm,
            budget,
            begin,
            end,
            dry_run,
        } => {
            if *dry_run {
                println!("🔍 [DRY-RUN] 更新项目集 #{}", id);
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({});
                if let Some(v) = name {
                    body["name"] = json!(v);
                }
                if let Some(v) = code {
                    body["code"] = json!(v);
                }
                if let Some(v) = desc {
                    body["desc"] = json!(v);
                }
                if let Some(v) = status {
                    body["status"] = json!(v);
                }
                if let Some(v) = parent {
                    body["parent"] = json!(v);
                }
                if let Some(v) = pm {
                    body["PM"] = json!(v);
                }
                if let Some(v) = budget {
                    body["budget"] = json!(v);
                }
                if let Some(v) = begin {
                    body["begin"] = json!(v);
                }
                if let Some(v) = end {
                    body["end"] = json!(v);
                }
                let result = ac.put(&format!("/programs/{}", id), &body)?;
                println!("✅ 项目集 #{} 更新成功", id);
                utils::print_json(&result);
                Ok(())
            })
        }
        ProgramCommands::Delete { id, yes, dry_run } => {
            if !yes && !*dry_run {
                println!("⚠️  确认删除项目集 #{}? 使用 --yes 确认", id);
                return Ok(());
            }
            if *dry_run {
                println!("🔍 [DRY-RUN] 删除项目集 #{}", id);
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let result = ac.delete(&format!("/programs/{}", id))?;
                println!("✅ 项目集 #{} 已删除", id);
                utils::print_json(&result);
                Ok(())
            })
        }
    }
}

