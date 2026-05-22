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
pub enum ExecutionCommands {
    /// List executions/sprints
    List {
        /// Project ID to filter by
        #[arg(short = 'p', long)]
        project: Option<i64>,
        /// Status filter (all/undone/wait/doing)
        #[arg(short = 's', long, default_value = "undone")]
        status: String,
        /// Order by field (rawID_asc/nameCol_asc/begin_asc/end_asc)
        #[arg(short = 'o', long, default_value = "rawID_asc")]
        order_by: String,
        /// Page number
        #[arg(short = 'g', long, default_value = "1")]
        page: u32,
        /// Results per page
        #[arg(short = 'n', long, default_value = "20")]
        limit: u32,
    },
    /// Get execution details
    Get {
        /// Execution ID
        id: i64,
    },
    /// Create an execution/sprint
    Create {
        /// Project ID
        #[arg(short = 'p', long)]
        project: i64,
        /// Name
        #[arg(short, long)]
        name: String,
        /// Code/prefix
        #[arg(short, long)]
        code: Option<String>,
        /// Begin date (YYYY-MM-DD)
        #[arg(long)]
        begin: String,
        /// End date (YYYY-MM-DD)
        #[arg(long)]
        end: String,
        /// Lifetime (short/long/ops)
        #[arg(short = 'l', long, default_value = "short")]
        lifetime: String,
        /// Available work days
        #[arg(short = 'y', long)]
        days: Option<i32>,
        /// Product IDs (comma-separated)
        #[arg(long, value_delimiter = ',')]
        products: Option<Vec<i64>>,
        /// Plans mapping (JSON: {"productId": [planId, ...]})
        #[arg(long)]
        plans: Option<String>,
        /// Product Owner
        #[arg(long)]
        po: Option<String>,
        /// QA Director
        #[arg(long)]
        qd: Option<String>,
        /// PM (execution manager)
        #[arg(long)]
        pm: Option<String>,
        /// RD Director
        #[arg(long)]
        rd: Option<String>,
        /// ACL (open/private)
        #[arg(long, default_value = "open")]
        acl: String,
        /// Description
        #[arg(short, long)]
        desc: Option<String>,
        /// Dry run
        #[arg(long)]
        dry_run: bool,
    },
    /// Update an execution
    Update {
        /// Execution ID
        id: i64,
        /// New name
        #[arg(short, long)]
        name: String,
        /// Begin date (YYYY-MM-DD)
        #[arg(long)]
        begin: String,
        /// End date (YYYY-MM-DD)
        #[arg(long)]
        end: String,
        /// Project ID
        #[arg(long)]
        project: Option<i64>,
        /// Lifetime (short/long/ops)
        #[arg(short = 'l', long)]
        lifetime: Option<String>,
        /// Available work days
        #[arg(short = 'y', long)]
        days: Option<i32>,
        /// Product IDs (comma-separated)
        #[arg(long, value_delimiter = ',')]
        products: Option<Vec<i64>>,
        /// Plans mapping (JSON)
        #[arg(long)]
        plans: Option<String>,
        /// Product Owner
        #[arg(long)]
        po: Option<String>,
        /// QA Director
        #[arg(long)]
        qd: Option<String>,
        /// PM (execution manager)
        #[arg(long)]
        pm: Option<String>,
        /// RD Director
        #[arg(long)]
        rd: Option<String>,
        /// ACL (open/private)
        #[arg(long)]
        acl: Option<String>,
        /// New description
        #[arg(short, long)]
        desc: Option<String>,
        /// Status (wait/doing/closed/suspended)
        #[arg(short, long)]
        status: Option<String>,
        /// Dry run
        #[arg(long)]
        dry_run: bool,
    },
    /// Start an execution
    Start {
        /// Execution ID
        id: i64,
        /// Dry run
        #[arg(long)]
        dry_run: bool,
    },
    /// Close an execution
    Close {
        /// Execution ID
        id: i64,
        /// Dry run
        #[arg(long)]
        dry_run: bool,
    },
    /// Suspend an execution
    Suspend {
        /// Execution ID
        id: i64,
        /// Dry run
        #[arg(long)]
        dry_run: bool,
    },
    /// Delete an execution
    Delete {
        /// Execution ID
        id: i64,
        /// Skip confirmation
        #[arg(long)]
        yes: bool,
        /// Dry run
        #[arg(long)]
        dry_run: bool,
    },
    /// Link products to an execution
    LinkProducts {
        /// Execution ID
        id: i64,
        /// Product IDs (comma-separated)
        #[arg(short = 'p', long, value_delimiter = ',', required = true)]
        products: Vec<i64>,
        /// Plans mapping (JSON: {\"productId\": [planId, ...]})
        #[arg(long)]
        plans: Option<String>,
        /// Dry run
        #[arg(long)]
        dry_run: bool,
    },
}


pub fn handle_execution(
    client: &Client,
    auth: &Rc<RefCell<AuthManager>>,
    cmd: &ExecutionCommands,
) -> Result<(), String> {
    match cmd {
        ExecutionCommands::List { project, status, order_by, page, limit } => with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
            let mut path = format!(
                "/executions?status={}&orderBy={}&pageID={}&recPerPage={}",
                status, order_by, page, limit
            );
            if let Some(p) = project {
                path = format!("/projects/{}/executions?status={}&orderBy={}&pageID={}&recPerPage={}", p, status, order_by, page, limit);
            }
            let data = ac.get(&path)?;
            utils::print_table(&data, &["id", "name", "status", "begin", "end", "projectName"]);
            Ok(())
        }),
        ExecutionCommands::Get { id } => with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
            let data = ac.get(&format!("/executions/{}", id))?;
            utils::print_json(&data);
            Ok(())
        }),
        ExecutionCommands::Create { project, name, code, begin, end, lifetime, days, products, plans, po, qd, pm, rd, acl, desc, dry_run } => {
            if *dry_run {
                println!("🔍 [DRY-RUN] 创建执行: name={}, project={}", name, project);
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({
                    "project": project,
                    "name": name,
                    "begin": begin,
                    "end": end,
                    "lifetime": lifetime,
                    "acl": acl,
                });
                if let Some(c) = code { body["code"] = json!(c); }
                if let Some(d) = days { body["days"] = json!(d); }
                if let Some(p) = products { body["products"] = json!(p); }
                if let Some(pl) = plans {
                    if let Ok(val) = serde_json::from_str::<serde_json::Value>(pl) {
                        body["plans"] = val;
                    } else {
                        return Err("plans 参数必须是有效的 JSON 对象".to_string());
                    }
                }
                if let Some(v) = po { body["PO"] = json!(v); }
                if let Some(v) = qd { body["QD"] = json!(v); }
                if let Some(v) = pm { body["PM"] = json!(v); }
                if let Some(v) = rd { body["RD"] = json!(v); }
                if let Some(d) = desc { body["desc"] = json!(d); }
                let result = ac.post("/executions", &body)?;
                println!("✅ 执行创建成功");
                utils::print_json(&result);
                Ok(())
            })
        }
        ExecutionCommands::Update { id, name, begin, end, project, lifetime, days, products, plans, po, qd, pm, rd, acl, desc, status, dry_run } => {
            if *dry_run {
                println!("🔍 [DRY-RUN] 更新执行 #{}", id);
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({
                    "name": name,
                    "begin": begin,
                    "end": end,
                });
                if let Some(p) = project { body["project"] = json!(p); }
                if let Some(l) = lifetime { body["lifetime"] = json!(l); }
                if let Some(d) = days { body["days"] = json!(d); }
                if let Some(p) = products { body["products"] = json!(p); }
                if let Some(pl) = plans {
                    if let Ok(val) = serde_json::from_str::<serde_json::Value>(pl) {
                        body["plans"] = val;
                    } else {
                        return Err("plans 参数必须是有效的 JSON 对象".to_string());
                    }
                }
                if let Some(v) = po { body["PO"] = json!(v); }
                if let Some(v) = qd { body["QD"] = json!(v); }
                if let Some(v) = pm { body["PM"] = json!(v); }
                if let Some(v) = rd { body["RD"] = json!(v); }
                if let Some(a) = acl { body["acl"] = json!(a); }
                if let Some(d) = desc { body["desc"] = json!(d); }
                if let Some(s) = status { body["status"] = json!(s); }
                let result = ac.put(&format!("/executions/{}", id), &body)?;
                println!("✅ 执行 #{} 更新成功", id);
                utils::print_json(&result);
                Ok(())
            })
        }
        ExecutionCommands::Start { id, dry_run } => {
            if *dry_run { println!("🔍 [DRY-RUN] 开始执行 #{}", id); return Ok(()); }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                ac.put(&format!("/executions/{}/start", id), &json!({}))?;
                println!("✅ 执行 #{} 已开始", id);
                Ok(())
            })
        }
        ExecutionCommands::Close { id, dry_run } => {
            if *dry_run { println!("🔍 [DRY-RUN] 关闭执行 #{}", id); return Ok(()); }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                ac.put(&format!("/executions/{}/close", id), &json!({}))?;
                println!("✅ 执行 #{} 已关闭", id);
                Ok(())
            })
        }
        ExecutionCommands::Suspend { id, dry_run } => {
            if *dry_run { println!("🔍 [DRY-RUN] 挂起执行 #{}", id); return Ok(()); }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                ac.put(&format!("/executions/{}/suspend", id), &json!({}))?;
                println!("✅ 执行 #{} 已挂起", id);
                Ok(())
            })
        }
        ExecutionCommands::Delete { id, yes, dry_run } => {
            if !yes && !dry_run {
                eprintln!("⚠️  确认要删除执行 #{} 吗？使用 --yes 跳过确认", id);
                return Ok(());
            }
            if *dry_run { println!("🔍 [DRY-RUN] 删除执行 #{}", id); return Ok(()); }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                ac.delete(&format!("/executions/{}", id))?;
                println!("✅ 执行 #{} 已删除", id);
                Ok(())
            })
        }
        ExecutionCommands::LinkProducts { id, products, plans, dry_run } => {
            if *dry_run {
                println!("🔍 [DRY-RUN] 关联产品到执行 #{}: {:?}", id, products);
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({
                    "products": products,
                });
                if let Some(p) = plans {
                    if let Ok(val) = serde_json::from_str::<serde_json::Value>(p) {
                        body["plans"] = val;
                    } else {
                        return Err("plans 参数必须是有效的 JSON 对象".to_string());
                    }
                }
                let result = ac.post(&format!("/executions/{}/linkProducts", id), &body)?;
                println!("✅ 产品已关联到执行 #{}", id);
                utils::print_json(&result);
                Ok(())
            })
        }
    }
}

