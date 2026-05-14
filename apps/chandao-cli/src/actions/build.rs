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
pub enum BuildCommands {
    /// List builds (requires --project or --execution)
    List {
        /// Project ID
        #[arg(short = 'j', long)]
        project: Option<i64>,
        /// Execution ID
        #[arg(short = 'e', long)]
        execution: Option<i64>,
        /// Page number
        #[arg(short = 'g', long, default_value = "1")]
        page: u32,
        /// Records per page
        #[arg(short = 'n', long, default_value = "20")]
        limit: u32,
    },
    /// List builds by project
    ListByProject {
        /// Project ID
        #[arg(short, long)]
        project: i64,
        /// Page number
        #[arg(short = 'g', long, default_value = "1")]
        page: u32,
        /// Records per page
        #[arg(short = 'n', long, default_value = "20")]
        limit: u32,
    },
    /// List builds by execution/sprint
    ListByExecution {
        /// Execution ID
        #[arg(short, long)]
        execution: i64,
        /// Page number
        #[arg(short = 'g', long, default_value = "1")]
        page: u32,
        /// Records per page
        #[arg(short = 'n', long, default_value = "20")]
        limit: u32,
    },
    /// Create a build/version
    Create {
        /// Execution/sprint ID (required)
        #[arg(short, long)]
        execution: i64,
        /// Build name (required)
        #[arg(short, long)]
        name: String,
        /// Project ID (required)
        #[arg(short, long)]
        project: i64,
        /// Description
        #[arg(short, long)]
        desc: Option<String>,
        /// SCM path
        #[arg(long)]
        scm_path: Option<String>,
        /// File path
        #[arg(long)]
        file_path: Option<String>,
        /// Builder account
        #[arg(long)]
        builder: Option<String>,
        /// Build date (YYYY-MM-DD)
        #[arg(long)]
        date: Option<String>,
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
    /// Update a build/version
    Update {
        /// Build ID
        id: i64,
        /// Build name
        #[arg(short, long)]
        name: Option<String>,
        /// Description
        #[arg(short, long)]
        desc: Option<String>,
        /// SCM path
        #[arg(long)]
        scm_path: Option<String>,
        /// File path
        #[arg(long)]
        file_path: Option<String>,
        /// Builder account
        #[arg(long)]
        builder: Option<String>,
        /// Build date (YYYY-MM-DD)
        #[arg(long)]
        date: Option<String>,
        /// Status
        #[arg(short, long)]
        status: Option<String>,
        /// Dry run
        #[arg(long)]
        dry_run: bool,
    },
    /// Delete a build/version
    Delete {
        /// Build ID
        id: i64,
        /// Skip confirmation
        #[arg(long)]
        yes: bool,
        /// Dry run
        #[arg(long)]
        dry_run: bool,
    },
}


pub fn handle_build(
    client: &Client,
    auth: &Rc<RefCell<AuthManager>>,
    cmd: &BuildCommands,
) -> Result<(), String> {
    match cmd {
        BuildCommands::List { project, execution, page, limit } => {
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let data = if let Some(e) = execution {
                    ac.get(&format!(
                        "/executions/{}/builds?pageID={}&recPerPage={}",
                        e, page, limit
                    ))?
                } else if let Some(p) = project {
                    ac.get(&format!(
                        "/projects/{}/builds?pageID={}&recPerPage={}",
                        p, page, limit
                    ))?
                } else {
                    return Err("需要指定 --project 或 --execution".to_string());
                };
                utils::print_table(
                    &data,
                    &["id", "name", "projectName", "builder", "date", "desc"],
                );
                Ok(())
            })
        }
        BuildCommands::ListByProject {
            project,
            page,
            limit,
        } => {
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let data = ac.get(&format!(
                    "/projects/{}/builds?pageID={}&recPerPage={}",
                    project, page, limit
                ))?;
                utils::print_table(
                    &data,
                    &["id", "name", "projectName", "builder", "date", "desc"],
                );
                Ok(())
            })
        }
        BuildCommands::ListByExecution {
            execution,
            page,
            limit,
        } => {
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let data = ac.get(&format!(
                    "/executions/{}/builds?pageID={}&recPerPage={}",
                    execution, page, limit
                ))?;
                utils::print_table(
                    &data,
                    &["id", "name", "projectName", "builder", "date", "desc"],
                );
                Ok(())
            })
        }
        BuildCommands::Create {
            execution,
            name,
            project,
            desc,
            scm_path,
            file_path,
            builder,
            date,
            link_bug,
            link_story,
            dry_run,
        } => {
            if *dry_run {
                println!(
                    "🔍 [DRY-RUN] 创建版本: name={}, execution={}, project={}",
                    name, execution, project
                );
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({
                    "execution": execution,
                    "name": name,
                    "project": project,
                });
                if let Some(v) = desc {
                    body["desc"] = json!(v);
                }
                if let Some(v) = scm_path {
                    body["scmPath"] = json!(v);
                }
                if let Some(v) = file_path {
                    body["filePath"] = json!(v);
                }
                if let Some(v) = builder {
                    body["builder"] = json!(v);
                }
                if let Some(v) = date {
                    body["date"] = json!(v);
                }
                if let Some(v) = link_bug {
                    body["linkBug"] = json!(v);
                }
                if let Some(v) = link_story {
                    body["linkStory"] = json!(v);
                }
                let result = ac.post("/builds", &body)?;
                println!("✅ 版本创建成功");
                utils::print_json(&result);
                Ok(())
            })
        }
        BuildCommands::Update {
            id,
            name,
            desc,
            scm_path,
            file_path,
            builder,
            date,
            status,
            dry_run,
        } => {
            if *dry_run {
                println!("🔍 [DRY-RUN] 更新版本 #{}", id);
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
                if let Some(v) = scm_path {
                    body["scmPath"] = json!(v);
                }
                if let Some(v) = file_path {
                    body["filePath"] = json!(v);
                }
                if let Some(v) = builder {
                    body["builder"] = json!(v);
                }
                if let Some(v) = date {
                    body["date"] = json!(v);
                }
                if let Some(v) = status {
                    body["status"] = json!(v);
                }
                let result = ac.put(&format!("/builds/{}", id), &body)?;
                println!("✅ 版本 #{} 更新成功", id);
                utils::print_json(&result);
                Ok(())
            })
        }
        BuildCommands::Delete { id, yes, dry_run } => {
            if !yes && !*dry_run {
                println!("⚠️  确认删除版本 #{}? 使用 --yes 确认", id);
                return Ok(());
            }
            if *dry_run {
                println!("🔍 [DRY-RUN] 删除版本 #{}", id);
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let result = ac.delete(&format!("/builds/{}", id))?;
                println!("✅ 版本 #{} 已删除", id);
                utils::print_json(&result);
                Ok(())
            })
        }
    }
}

