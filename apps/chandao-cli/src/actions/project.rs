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
pub enum ProjectCommands {
    /// List projects
    List {
        /// Browse type (unclosed, all, etc.)
        #[arg(short = 'b', long, default_value = "undone")]
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
    /// List projects by program
    ListByProgram {
        /// Program ID
        #[arg(short, long)]
        program: i64,
        /// Page number
        #[arg(short = 'g', long, default_value = "1")]
        page: u32,
        /// Records per page
        #[arg(short = 'n', long, default_value = "20")]
        limit: u32,
    },
    /// Get project details
    Get {
        /// Project ID
        id: i64,
    },
    /// Create a new project
    Create {
        /// Project name (required)
        #[arg(short, long)]
        name: String,
        /// Project code (required)
        #[arg(short, long)]
        code: String,
        /// Project model (scrum, waterfall, kanban, agileplus, waterfallplus)
        #[arg(short = 'm', long, default_value = "scrum")]
        model: String,
        /// Begin date (YYYY-MM-DD)
        #[arg(long)]
        begin: String,
        /// End date (YYYY-MM-DD)
        #[arg(long)]
        end: String,
        /// Parent project ID
        #[arg(long)]
        parent: Option<i64>,
        /// Status (wait, doing, suspended, closed)
        #[arg(short, long, default_value = "wait")]
        status: String,
        /// Description
        #[arg(short, long)]
        desc: Option<String>,
        /// Project budget (in hours)
        #[arg(long)]
        budget: Option<f64>,
        /// Product IDs (comma-separated)
        #[arg(long, value_delimiter = ',')]
        products: Option<Vec<i64>>,
        /// PM (project manager account)
        #[arg(long)]
        pm: Option<String>,
        /// Dry run
        #[arg(long)]
        dry_run: bool,
    },
    /// Update a project
    Update {
        /// Project ID
        id: i64,
        /// Project name (required)
        #[arg(short, long)]
        name: String,
        /// Project code
        #[arg(short, long)]
        code: Option<String>,
        /// Project model (scrum, waterfall, kanban, agileplus, waterfallplus) (required)
        #[arg(short = 'm', long)]
        model: String,
        /// Parent project ID
        #[arg(long)]
        parent: Option<i64>,
        /// Begin date (YYYY-MM-DD) (required)
        #[arg(long)]
        begin: String,
        /// End date (YYYY-MM-DD) (required)
        #[arg(long)]
        end: String,
        /// Status (wait, doing, suspended, closed)
        #[arg(short, long)]
        status: Option<String>,
        /// Description
        #[arg(short, long)]
        desc: Option<String>,
        /// Project budget (in hours)
        #[arg(long)]
        budget: Option<f64>,
        /// Product IDs (comma-separated)
        #[arg(long, value_delimiter = ',')]
        products: Option<Vec<i64>>,
        /// PM (project manager account)
        #[arg(long)]
        pm: Option<String>,
        /// Dry run
        #[arg(long)]
        dry_run: bool,
    },
    /// Delete a project
    Delete {
        /// Project ID
        id: i64,
        /// Skip confirmation
        #[arg(long)]
        yes: bool,
        /// Dry run
        #[arg(long)]
        dry_run: bool,
    },
}


pub fn handle_project(
    client: &Client,
    auth: &Rc<RefCell<AuthManager>>,
    cmd: &ProjectCommands,
) -> Result<(), String> {
    match cmd {
        ProjectCommands::List {
            browse_type,
            order_by,
            page,
            limit,
        } => {
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let data = ac.get(&format!(
                    "/projects?browseType={}&orderBy={}&recPerPage={}&pageID={}",
                    browse_type, order_by, limit, page
                ))?;
                utils::print_table(
                    &data,
                    &["id", "name", "code", "status", "type", "begin", "end", "PM"],
                );
                Ok(())
            })
        }
        ProjectCommands::ListByProgram {
            program,
            page,
            limit,
        } => {
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let data = ac.get(&format!(
                    "/programs/{}/projects?pageID={}&recPerPage={}",
                    program, page, limit
                ))?;
                utils::print_table(
                    &data,
                    &["id", "name", "code", "status", "type", "begin", "end", "PM"],
                );
                Ok(())
            })
        }
        ProjectCommands::Get { id } => {
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let data = ac.get(&format!("/projects/{}", id))?;
                utils::print_json(&data);
                Ok(())
            })
        }
        ProjectCommands::Create {
            name,
            code,
            model,
            begin,
            end,
            parent,
            status,
            desc,
            budget,
            products,
            pm,
            dry_run,
        } => {
            if *dry_run {
                println!(
                    "🔍 [DRY-RUN] 创建项目: name={}, code={}, model={}",
                    name, code, model
                );
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({
                    "name": name,
                    "code": code,
                    "model": model,
                    "begin": begin,
                    "end": end,
                });
                body["status"] = json!(status);
                if let Some(v) = parent {
                    body["parent"] = json!(v);
                }
                if let Some(v) = desc {
                    body["desc"] = json!(v);
                }
                if let Some(v) = budget {
                    body["budget"] = json!(v);
                }
                if let Some(v) = products {
                    body["products"] = json!(v);
                }
                if let Some(v) = pm {
                    body["PM"] = json!(v);
                }
                let result = ac.post("/projects", &body)?;
                println!("✅ 项目创建成功");
                utils::print_json(&result);
                Ok(())
            })
        }
        ProjectCommands::Update {
            id,
            name,
            code,
            model,
            parent,
            begin,
            end,
            status,
            desc,
            budget,
            products,
            pm,
            dry_run,
        } => {
            if *dry_run {
                println!("🔍 [DRY-RUN] 更新项目 #{}, name={}, model={}, begin={}, end={}", id, name, model, begin, end);
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({
                    "name": name,
                    "model": model,
                    "begin": begin,
                    "end": end,
                });
                if let Some(v) = code {
                    body["code"] = json!(v);
                }
                if let Some(v) = parent {
                    body["parent"] = json!(v);
                }
                if let Some(v) = status {
                    body["status"] = json!(v);
                }
                if let Some(v) = desc {
                    body["desc"] = json!(v);
                }
                if let Some(v) = budget {
                    body["budget"] = json!(v);
                }
                if let Some(v) = products {
                    body["products"] = json!(v);
                }
                if let Some(v) = pm {
                    body["PM"] = json!(v);
                }
                let result = ac.put(&format!("/projects/{}", id), &body)?;
                println!("✅ 项目 #{} 更新成功", id);
                utils::print_json(&result);
                Ok(())
            })
        }
        ProjectCommands::Delete { id, yes, dry_run } => {
            if !yes && !*dry_run {
                println!("⚠️  确认删除项目 #{}? 使用 --yes 确认", id);
                return Ok(());
            }
            if *dry_run {
                println!("🔍 [DRY-RUN] 删除项目 #{}", id);
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let result = ac.delete(&format!("/projects/{}", id))?;
                println!("✅ 项目 #{} 已删除", id);
                utils::print_json(&result);
                Ok(())
            })
        }
    }
}

