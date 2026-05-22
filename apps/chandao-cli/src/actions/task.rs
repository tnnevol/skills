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
pub enum TaskCommands {
    /// List tasks
    List {
        /// Execution ID
        #[arg(short = 'e', long)]
        execution: Option<i64>,
        /// Page
        #[arg(short = 'g', long, default_value = "1")]
        page: u32,
        /// Limit
        #[arg(short = 'n', long, default_value = "20")]
        limit: u32,
    },
    /// Get task
    Get { id: i64 },
    /// Create task
    Create {
        /// Execution ID
        #[arg(short = 'e', long)]
        execution: i64,
        /// Task name
        #[arg(short, long)]
        name: String,
        /// Assigned to
        #[arg(short = 'a', long)]
        assigned: Option<String>,
        /// Priority (1-4)
        #[arg(short = 'i', long)]
        pri: Option<u8>,
        /// Estimate (hours)
        #[arg(long)]
        estimate: Option<f64>,
        /// Description
        #[arg(short, long)]
        desc: Option<String>,
        /// Type (devel/test/design/discuss/ui)
        #[arg(short = 'y', long, default_value = "devel")]
        r#type: String,
        /// Story ID
        #[arg(long)]
        story: Option<i64>,
        /// Module ID
        #[arg(short = 'm', long)]
        module: Option<i64>,
        /// Estimated start date (YYYY-MM-DD)
        #[arg(long)]
        est_started: Option<String>,
        /// Deadline (YYYY-MM-DD)
        #[arg(long)]
        deadline: Option<String>,
        /// Dry run
        #[arg(long)]
        dry_run: bool,
    },
    /// Update task
    Update {
        id: i64,
        #[arg(short, long)]
        name: Option<String>,
        #[arg(short = 'a', long)]
        assigned: Option<String>,
        #[arg(short = 'i', long)]
        pri: Option<u8>,
        #[arg(short, long)]
        status: Option<String>,
        #[arg(long)]
        estimate: Option<f64>,
        #[arg(long)]
        consumed: Option<f64>,
        #[arg(long)]
        dry_run: bool,
    },
    /// Start task (status → doing)
    Start {
        id: i64,
        /// Hours consumed so far
        #[arg(long, default_value = "0.0")]
        consumed: f64,
        /// Hours remaining
        #[arg(long, default_value = "0.0")]
        left: f64,
        #[arg(long)]
        dry_run: bool,
    },
    /// Finish task (status → done)
    Finish {
        id: i64,
        /// Consumed hours (required to finish)
        #[arg(short = 'c', long)]
        consumed: Option<f64>,
        /// Actual start date (default: today)
        #[arg(long)]
        real_started: Option<String>,
        /// Actual finish date (default: today)
        #[arg(long)]
        finished_date: Option<String>,
        #[arg(long)]
        dry_run: bool,
    },
    /// Close task
    Close {
        id: i64,
        #[arg(short = 'r', long)]
        reason: Option<String>,
        #[arg(long)]
        dry_run: bool,
    },
    /// Activate task (reactivate a task)
    Activate {
        id: i64,
        #[arg(short, long)]
        comment: Option<String>,
        #[arg(long)]
        dry_run: bool,
    },
    /// Delete task
    Delete {
        id: i64,
        #[arg(long)]
        yes: bool,
        #[arg(long)]
        dry_run: bool,
    },
}


pub fn handle_task(
    client: &Client,
    auth: &Rc<RefCell<AuthManager>>,
    cmd: &TaskCommands,
) -> Result<(), String> {
    match cmd {
        TaskCommands::List { execution, page, limit } => with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
            let path = if let Some(e) = execution {
                format!("/executions/{}/tasks?pageID={}&recPerPage={}", e, page, limit)
            } else {
                format!("/tasks?pageID={}&recPerPage={}", page, limit)
            };
            let data = ac.get(&path)?;
            utils::print_table(&data, &["id", "name", "status", "assignedTo", "pri", "estimate", "consumed"]);
            Ok(())
        }),
        TaskCommands::Get { id } => with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
            let data = ac.get(&format!("/tasks/{}", id))?;
            utils::print_json(&data);
            Ok(())
        }),
        TaskCommands::Create { execution, name, assigned, pri, estimate, desc, r#type, story, module, est_started, deadline, dry_run } => {
            if *dry_run { println!("🔍 [DRY-RUN] 创建任务: {}", name); return Ok(()); }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({
                    "executionID": execution,
                    "name": name,
                    "type": r#type,
                });
                if let Some(a) = assigned { body["assignedTo"] = json!(a); }
                if let Some(p) = pri { body["pri"] = json!(p); }
                if let Some(e) = estimate { body["estimate"] = json!(e); }
                if let Some(d) = desc { body["desc"] = json!(d); }
                if let Some(s) = story { body["story"] = json!(s); }
                if let Some(m) = module { body["module"] = json!(m); }
                if let Some(es) = est_started { body["estStarted"] = json!(es); }
                if let Some(dl) = deadline { body["deadline"] = json!(dl); }
                let result = ac.post("/tasks", &body)?;
                println!("✅ 任务创建成功");
                utils::print_json(&result);
                Ok(())
            })
        }
        TaskCommands::Update { id, name, assigned, pri, status, estimate, consumed, dry_run } => {
            if *dry_run { println!("🔍 [DRY-RUN] 更新任务 #{}", id); return Ok(()); }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({});
                if let Some(n) = name { body["name"] = json!(n); }
                if let Some(a) = assigned { body["assignedTo"] = json!(a); }
                if let Some(p) = pri { body["pri"] = json!(p); }
                if let Some(s) = status { body["status"] = json!(s); }
                if let Some(e) = estimate { body["estimate"] = json!(e); }
                if let Some(c) = consumed { body["consumed"] = json!(c); }
                let result = ac.put(&format!("/tasks/{}", id), &body)?;
                println!("✅ 任务 #{} 更新成功", id);
                utils::print_json(&result);
                Ok(())
            })
        }
        TaskCommands::Start { id, consumed, left, dry_run } => {
            if *dry_run { println!("🔍 [DRY-RUN] 开始任务 #{} (consumed={}, left={})", id, consumed, left); return Ok(()); }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                ac.put(&format!("/tasks/{}/start", id), &json!({"consumed": consumed, "left": left}))?;
                println!("✅ 任务 #{} 已开始", id);
                Ok(())
            })
        }
        TaskCommands::Finish { id, consumed, real_started, finished_date, dry_run } => {
            if *dry_run {
                println!("🔍 [DRY-RUN] 完成任务 #{} (consumed={:?}h)", id, consumed);
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({});
                if let Some(c) = consumed {
                    body["currentConsumed"] = json!(c);
                }
                let now = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
                body["realStarted"] = json!(real_started.as_deref().unwrap_or(&now));
                body["finishedDate"] = json!(finished_date.as_deref().unwrap_or(&now));
                ac.put(&format!("/tasks/{}/finish", id), &body)?;
                println!("✅ 任务 #{} 已完成", id);
                Ok(())
            })
        }
        TaskCommands::Close { id, reason, dry_run } => {
            if *dry_run {
                println!("🔍 [DRY-RUN] 关闭任务 #{}", id);
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({});
                if let Some(r) = reason {
                    body["comment"] = json!(r);
                }
                ac.put(&format!("/tasks/{}/close", id), &body)?;
                println!("✅ 任务 #{} 已关闭", id);
                Ok(())
            })
        }
        TaskCommands::Activate { id, comment, dry_run } => {
            if *dry_run {
                println!("🔍 [DRY-RUN] 激活任务 #{}", id);
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({});
                if let Some(c) = comment {
                    body["comment"] = json!(c);
                }
                ac.put(&format!("/tasks/{}/activate", id), &body)?;
                println!("✅ 任务 #{} 已激活", id);
                Ok(())
            })
        }
        TaskCommands::Delete { id, yes, dry_run } => {
            if !yes && !dry_run { eprintln!("⚠️  确认删除任务 #{}？使用 --yes", id); return Ok(()); }
            if *dry_run { println!("🔍 [DRY-RUN] 删除任务 #{}", id); return Ok(()); }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                ac.delete(&format!("/tasks/{}", id))?;
                println!("✅ 任务 #{} 已删除", id);
                Ok(())
            })
        }
    }
}

