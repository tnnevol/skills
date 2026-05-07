//! Action handlers for all 禅道 modules.
//!
//! Each module (story/task/bug/execution/testcase) has its own subcommand enum
//! and handler function. All handlers receive an AuthenticatedClient and
//! dispatch to the appropriate API calls.

use std::cell::RefCell;
use std::rc::Rc;

use clap::Subcommand;
use serde_json::json;

use crate::auth::AuthManager;
use crate::client::{AuthenticatedClient, Client};
use crate::utils;

// ── Execution / Sprint ──

#[derive(Subcommand)]
pub enum ExecutionCommands {
    /// List executions/sprints
    List {
        /// Project ID to filter by
        #[arg(short = 'p', long)]
        project: Option<i64>,
        /// Page number
        #[arg(short, long, default_value = "1")]
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
        name: Option<String>,
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

// ── Story ──

#[derive(Subcommand)]
pub enum StoryCommands {
    /// List stories
    List {
        /// Product ID
        #[arg(short = 'p', long)]
        product: Option<i64>,
        /// Page
        #[arg(short, long, default_value = "1")]
        page: u32,
        /// Limit
        #[arg(short = 'n', long, default_value = "20")]
        limit: u32,
    },
    /// Get story
    Get { id: i64 },
    /// Create story
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
        #[arg(short, long)]
        pri: Option<u8>,
        /// Source
        #[arg(short, long)]
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
    /// Update story
    Update {
        /// Story ID
        id: i64,
        #[arg(short, long)]
        title: Option<String>,
        #[arg(short, long)]
        desc: Option<String>,
        #[arg(short = 'm', long)]
        module: Option<i64>,
        #[arg(short, long)]
        pri: Option<u8>,
        #[arg(short = 'a', long)]
        assigned: Option<String>,
        #[arg(short, long)]
        status: Option<String>,
        #[arg(long)]
        dry_run: bool,
    },
    /// Review a story (approve/reject)
    Review {
        /// Story ID
        id: i64,
        /// Result: pass, reject, revert
        #[arg(short, long)]
        result: String,
        /// Review comment
        #[arg(short, long)]
        comment: Option<String>,
        #[arg(long)]
        dry_run: bool,
    },
    /// Close a story
    Close {
        id: i64,
        /// Reason: done, duplicate, postponed, willnotfix, bydesign
        #[arg(short, long)]
        reason: String,
        #[arg(long)]
        dry_run: bool,
    },
    /// Activate a closed story
    Activate {
        id: i64,
        #[arg(long)]
        dry_run: bool,
    },
    /// Delete story
    Delete {
        id: i64,
        #[arg(long)]
        yes: bool,
        #[arg(long)]
        dry_run: bool,
    },
    /// Change a story (submit for review)
    Change {
        /// Story ID
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
}

// ── Task ──

#[derive(Subcommand)]
pub enum TaskCommands {
    /// List tasks
    List {
        /// Execution ID
        #[arg(short = 'e', long)]
        execution: Option<i64>,
        /// Page
        #[arg(short, long, default_value = "1")]
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
        #[arg(short, long)]
        pri: Option<u8>,
        /// Estimate (hours)
        #[arg(long)]
        estimate: Option<f64>,
        /// Description
        #[arg(short, long)]
        desc: Option<String>,
        /// Type (devel/test/design/discuss/ui)
        #[arg(short, long, default_value = "devel")]
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
        #[arg(short, long)]
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
        #[arg(long)]
        dry_run: bool,
    },
    /// Finish task (status → done)
    Finish {
        id: i64,
        /// Consumed hours (required by 禅道 to finish)
        #[arg(short = 'c', long)]
        consumed: Option<f64>,
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

// ── Bug ──

#[derive(Subcommand)]
pub enum BugCommands {
    /// List bugs
    List {
        /// Product ID
        #[arg(short = 'p', long)]
        product: Option<i64>,
        /// Page
        #[arg(short, long, default_value = "1")]
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
        #[arg(short, long)]
        pri: Option<u8>,
        /// Severity (1-4)
        #[arg(short = 's', long)]
        severity: Option<u8>,
        /// Type (codeassign/interface/config/design/others)
        #[arg(short, long, default_value = "codeassign")]
        r#type: String,
        /// Opened build
        #[arg(short = 'b', long)]
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
        #[arg(short, long)]
        pri: Option<u8>,
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

// ── Testcase ──

#[derive(Subcommand)]
pub enum TestcaseCommands {
    /// List test cases
    List {
        /// Product ID
        #[arg(short = 'p', long)]
        product: Option<i64>,
        /// Page
        #[arg(short, long, default_value = "1")]
        page: u32,
        /// Limit
        #[arg(short = 'n', long, default_value = "20")]
        limit: u32,
    },
    /// Get test case
    Get { id: i64 },
    /// Create test case
    Create {
        /// Product ID
        #[arg(short = 'p', long)]
        product: i64,
        /// Project ID
        #[arg(short = 'j', long)]
        project: Option<i64>,
        /// Execution ID
        #[arg(short = 'e', long)]
        execution: Option<i64>,
        /// Module ID
        #[arg(short = 'm', long)]
        module: Option<i64>,
        /// Title
        #[arg(short, long)]
        title: String,
        /// Type (feature/performance/config/interface/security/other/unit/install)
        #[arg(short, long, default_value = "feature")]
        r#type: String,
        /// Stage (unit/feature/intergr/system/accept/others)
        #[arg(short, long, default_value = "feature")]
        stage: String,
        /// Priority (1-4)
        #[arg(short, long)]
        pri: Option<u8>,
        /// Preconditions
        #[arg(long)]
        precondition: Option<String>,
        /// Steps (JSON array of {step,expect})
        #[arg(long)]
        steps: Option<String>,
        /// Expected results (overrides expect from steps JSON)
        #[arg(long)]
        expect: Option<String>,
        /// Step type (step/group)
        #[arg(long, default_value = "step")]
        step_type: Option<String>,
        /// Story ID
        #[arg(long)]
        story: Option<i64>,
        /// Dry run
        #[arg(long)]
        dry_run: bool,
    },
    /// Update test case
    Update {
        id: i64,
        #[arg(short, long)]
        title: Option<String>,
        #[arg(short, long)]
        status: Option<String>,
        #[arg(long)]
        steps: Option<String>,
        #[arg(long)]
        dry_run: bool,
    },
    /// Delete test case
    Delete {
        id: i64,
        #[arg(long)]
        yes: bool,
        #[arg(long)]
        dry_run: bool,
    },
}

// ── Handler functions ──

macro_rules! with_auth {
    ($client:expr, $auth:expr, $body:expr) => {{
        let mut ac = $client.authenticate($auth)?;
        $body(&mut ac)
    }};
}

pub fn handle_execution(
    client: &Client,
    auth: &Rc<RefCell<AuthManager>>,
    cmd: &ExecutionCommands,
) -> Result<(), String> {
    match cmd {
        ExecutionCommands::List { project, page, limit } => with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
            let mut path = format!(
                "/executions.json?pageID={}&recPerPage={}",
                page, limit
            );
            if let Some(p) = project {
                path = format!("/projects/{}/executions.json?pageID={}&recPerPage={}", p, page, limit);
            }
            let data = ac.get(&path)?;
            utils::print_table(&data, &["id", "name", "status", "begin", "end", "projectName"]);
            Ok(())
        }),
        ExecutionCommands::Get { id } => with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
            let data = ac.get(&format!("/executions/{}.json", id))?;
            utils::print_json(&data);
            Ok(())
        }),
        ExecutionCommands::Create { project, name, code, begin, end, desc, dry_run } => {
            if *dry_run {
                println!("🔍 [DRY-RUN] 创建执行: name={}, project={}", name, project);
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({
                    "project": project,
                    "name": name,
                });
                if let Some(c) = code { body["code"] = json!(c); }
                body["begin"] = json!(begin);
                body["end"] = json!(end);
                if let Some(d) = desc { body["desc"] = json!(d); }
                let result = ac.post("/executions", &body)?;
                println!("✅ 执行创建成功");
                utils::print_json(&result);
                Ok(())
            })
        }
        ExecutionCommands::Update { id, name, desc, status, dry_run } => {
            if *dry_run {
                println!("🔍 [DRY-RUN] 更新执行 #{}", id);
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({});
                if let Some(n) = name { body["name"] = json!(n); }
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

pub fn handle_story(
    client: &Client,
    auth: &Rc<RefCell<AuthManager>>,
    cmd: &StoryCommands,
) -> Result<(), String> {
    match cmd {
        StoryCommands::List { product, page, limit } => with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
            let path = if let Some(p) = product {
                format!("/products/{}/stories.json?pageID={}&recPerPage={}", p, page, limit)
            } else {
                format!("/stories.json?pageID={}&recPerPage={}", page, limit)
            };
            let data = ac.get(&path)?;
            utils::print_table(&data, &["id", "title", "status", "pri", "productName", "openedDate"]);
            Ok(())
        }),
        StoryCommands::Get { id } => with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
            let data = ac.get(&format!("/stories/{}.json", id))?;
            utils::print_json(&data);
            Ok(())
        }),
        StoryCommands::Create { product, title, spec, verify, module, pri, source, assigned, estimate, dry_run } => {
            if *dry_run { println!("🔍 [DRY-RUN] 创建需求: {}", title); return Ok(()); }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({"product": product, "title": title});
                if let Some(d) = spec { body["spec"] = json!(d); }
                if let Some(v) = verify { body["verify"] = json!(v); }
                if let Some(m) = module { body["module"] = json!(m); }
                if let Some(p) = pri { body["pri"] = json!(p); }
                if let Some(s) = source { body["source"] = json!(s); }
                if let Some(a) = assigned { body["assignedTo"] = json!(a); }
                if let Some(e) = estimate { body["estimate"] = json!(e); }
                let result = ac.post("/stories", &body)?;
                println!("✅ 需求创建成功");
                utils::print_json(&result);
                Ok(())
            })
        }
        StoryCommands::Update { id, title, desc, module, pri, assigned, status, dry_run } => {
            if *dry_run { println!("🔍 [DRY-RUN] 更新需求 #{}", id); return Ok(()); }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({});
                if let Some(t) = title { body["title"] = json!(t); }
                if let Some(d) = desc { body["desc"] = json!(d); }
                if let Some(m) = module { body["module"] = json!(m); }
                if let Some(p) = pri { body["pri"] = json!(p); }
                if let Some(a) = assigned { body["assignedTo"] = json!(a); }
                if let Some(s) = status { body["status"] = json!(s); }
                let result = ac.put(&format!("/stories/{}", id), &body)?;
                println!("✅ 需求 #{} 更新成功", id);
                utils::print_json(&result);
                Ok(())
            })
        }
        StoryCommands::Review { id, result, comment, dry_run } => {
            if *dry_run { println!("🔍 [DRY-RUN] 评审需求 #{}: {}", id, result); return Ok(()); }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({"result": result});
                if let Some(c) = comment { body["comment"] = json!(c); }
                ac.post(&format!("/stories/{}/review", id), &body)?;
                println!("✅ 需求 #{} 评审完成: {}", id, result);
                Ok(())
            })
        }
        StoryCommands::Close { id, reason, dry_run } => {
            if *dry_run { println!("🔍 [DRY-RUN] 关闭需求 #{}", id); return Ok(()); }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let body = json!({"reason": reason});
                ac.put(&format!("/stories/{}/close", id), &body)?;
                println!("✅ 需求 #{} 已关闭", id);
                Ok(())
            })
        }
        StoryCommands::Activate { id, dry_run } => {
            if *dry_run { println!("🔍 [DRY-RUN] 激活需求 #{}", id); return Ok(()); }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                ac.put(&format!("/stories/{}/activate", id), &json!({}))?;
                println!("✅ 需求 #{} 已激活", id);
                Ok(())
            })
        }
        StoryCommands::Delete { id, yes, dry_run } => {
            if !yes && !dry_run { eprintln!("⚠️  确认删除需求 #{}？使用 --yes", id); return Ok(()); }
            if *dry_run { println!("🔍 [DRY-RUN] 删除需求 #{}", id); return Ok(()); }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                ac.delete(&format!("/stories/{}", id))?;
                println!("✅ 需求 #{} 已删除", id);
                Ok(())
            })
        }
        StoryCommands::Change { id, reviewer, title, spec, verify, dry_run } => {
            if *dry_run { println!("🔍 [DRY-RUN] 变更需求 #{}: reviewer={:?}", id, reviewer); return Ok(()); }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({"reviewer": reviewer});
                if let Some(t) = title { body["title"] = json!(t); }
                if let Some(s) = spec { body["spec"] = json!(s); }
                if let Some(v) = verify { body["verify"] = json!(v); }
                let result = ac.put(&format!("/stories/{}/change", id), &body)?;
                println!("✅ 需求 #{} 已提交变更", id);
                utils::print_json(&result);
                Ok(())
            })
        }
    }
}

pub fn handle_task(
    client: &Client,
    auth: &Rc<RefCell<AuthManager>>,
    cmd: &TaskCommands,
) -> Result<(), String> {
    match cmd {
        TaskCommands::List { execution, page, limit } => with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
            let path = if let Some(e) = execution {
                format!("/executions/{}/tasks.json?pageID={}&recPerPage={}", e, page, limit)
            } else {
                format!("/tasks.json?pageID={}&recPerPage={}", page, limit)
            };
            let data = ac.get(&path)?;
            utils::print_table(&data, &["id", "name", "status", "assignedTo", "pri", "estimate", "consumed"]);
            Ok(())
        }),
        TaskCommands::Get { id } => with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
            let data = ac.get(&format!("/tasks/{}.json", id))?;
            utils::print_json(&data);
            Ok(())
        }),
        TaskCommands::Create { execution, name, assigned, pri, estimate, desc, r#type, story, module, est_started, deadline, dry_run } => {
            if *dry_run { println!("🔍 [DRY-RUN] 创建任务: {}", name); return Ok(()); }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({
                    "execution": execution,
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
        TaskCommands::Start { id, dry_run } => {
            if *dry_run { println!("🔍 [DRY-RUN] 开始任务 #{}", id); return Ok(()); }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                ac.put(&format!("/tasks/{}/start", id), &json!({}))?;
                println!("✅ 任务 #{} 已开始", id);
                Ok(())
            })
        }
        TaskCommands::Finish { id, consumed, dry_run } => {
            if *dry_run {
                println!("🔍 [DRY-RUN] 完成任务 #{} (consumed={:?}h)", id, consumed);
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({});
                if let Some(c) = consumed {
                    body["consumed"] = json!(c);
                }
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

pub fn handle_bug(
    client: &Client,
    auth: &Rc<RefCell<AuthManager>>,
    cmd: &BugCommands,
) -> Result<(), String> {
    match cmd {
        BugCommands::List { product, page, limit } => with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
            let path = if let Some(p) = product {
                format!("/products/{}/bugs.json?pageID={}&recPerPage={}", p, page, limit)
            } else {
                format!("/bugs.json?pageID={}&recPerPage={}", page, limit)
            };
            let data = ac.get(&path)?;
            utils::print_table(&data, &["id", "title", "status", "severity", "pri", "assignedTo"]);
            Ok(())
        }),
        BugCommands::Get { id } => with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
            let data = ac.get(&format!("/bugs/{}.json", id))?;
            utils::print_json(&data);
            Ok(())
        }),
        BugCommands::Create { product, title, assigned, pri, severity, r#type, opened_build, desc, module, execution, task, story, os, browser, dry_run } => {
            if *dry_run { println!("🔍 [DRY-RUN] 创建Bug: {}", title); return Ok(()); }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({"product": product, "title": title, "type": r#type, "openedBuild": [opened_build]});
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
        BugCommands::Update { id, title, assigned, status, pri, dry_run } => {
            if *dry_run { println!("🔍 [DRY-RUN] 更新Bug #{}", id); return Ok(()); }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({});
                if let Some(t) = title { body["title"] = json!(t); }
                if let Some(a) = assigned { body["assignedTo"] = json!(a); }
                if let Some(s) = status { body["status"] = json!(s); }
                if let Some(p) = pri { body["pri"] = json!(p); }
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

pub fn handle_testcase(
    client: &Client,
    auth: &Rc<RefCell<AuthManager>>,
    cmd: &TestcaseCommands,
) -> Result<(), String> {
    match cmd {
        TestcaseCommands::List { product, page, limit } => with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
            let path = if let Some(p) = product {
                format!("/products/{}/testcases.json?pageID={}&recPerPage={}", p, page, limit)
            } else {
                format!("/testcases.json?pageID={}&recPerPage={}", page, limit)
            };
            let data = ac.get(&path)?;
            utils::print_table(&data, &["id", "title", "status", "pri", "type", "stage"]);
            Ok(())
        }),
        TestcaseCommands::Get { id } => with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
            let data = ac.get(&format!("/testcases/{}.json", id))?;
            utils::print_json(&data);
            Ok(())
        }),
        TestcaseCommands::Create { product, module, title, r#type, stage, pri, precondition, steps, expect, step_type, story, project, execution, dry_run } => {
            if *dry_run { println!("🔍 [DRY-RUN] 创建测试用例: {}", title); return Ok(()); }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({
                    "product": product,
                    "title": title,
                    "type": r#type,
                    "stage": stage,
                });
                if let Some(m) = module { body["module"] = json!(m); }
                if let Some(p) = pri { body["pri"] = json!(p); }
                if let Some(pc) = precondition { body["precondition"] = json!(pc); }
                if let Some(s) = story { body["story"] = json!(s); }
                if let Some(p) = project { body["project"] = json!(p); }
                if let Some(e) = execution { body["execution"] = json!(e); }
                // Parse steps JSON [{step, expect}] into parallel arrays
                if let Some(s) = steps {
                    if let Ok(parsed) = serde_json::from_str::<Vec<serde_json::Value>>(&s) {
                        let step_strs: Vec<String> = parsed.iter().map(|v| {
                            v.get("step").and_then(|s| s.as_str()).unwrap_or("").to_string()
                        }).collect();
                        let expect_strs: Vec<String> = parsed.iter().map(|v| {
                            v.get("expect").and_then(|s| s.as_str()).unwrap_or("").to_string()
                        }).collect();
                        body["steps"] = json!(step_strs);
                        body["expects"] = json!(expect_strs);
                        body["stepType"] = json!(vec![step_type.as_deref().unwrap_or("step"); step_strs.len()]);
                    } else {
                        body["steps"] = json!([s]);
                        body["expects"] = json!([expect.as_deref().unwrap_or("")]);
                        body["stepType"] = json!([step_type.as_deref().unwrap_or("step")]);
                    }
                } else if let Some(e) = expect {
                    body["steps"] = json!([""]);
                    body["expects"] = json!([e]);
                    body["stepType"] = json!([step_type.as_deref().unwrap_or("step")]);
                }
                let result = ac.post("/testcases", &body)?;
                println!("✅ 测试用例创建成功");
                utils::print_json(&result);
                Ok(())
            })
        }
        TestcaseCommands::Update { id, title, status, steps, dry_run } => {
            if *dry_run { println!("🔍 [DRY-RUN] 更新测试用例 #{}", id); return Ok(()); }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({});
                if let Some(t) = title { body["title"] = json!(t); }
                if let Some(s) = status { body["status"] = json!(s); }
                if let Some(s) = steps { body["steps"] = json!(s); }
                let result = ac.put(&format!("/testcases/{}", id), &body)?;
                println!("✅ 测试用例 #{} 更新成功", id);
                utils::print_json(&result);
                Ok(())
            })
        }
        TestcaseCommands::Delete { id, yes, dry_run } => {
            if !yes && !dry_run { eprintln!("⚠️  确认删除测试用例 #{}？使用 --yes", id); return Ok(()); }
            if *dry_run { println!("🔍 [DRY-RUN] 删除测试用例 #{}", id); return Ok(()); }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                ac.delete(&format!("/testcases/{}", id))?;
                println!("✅ 测试用例 #{} 已删除", id);
                Ok(())
            })
        }
    }
}
