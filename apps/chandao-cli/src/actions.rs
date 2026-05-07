//! Action handlers for all 禅道 modules.
//!
//! Each module (story/task/bug/execution/testcase/system) has its own subcommand enum
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

// ── User ──

#[derive(Subcommand)]
pub enum UserCommands {
    /// List users
    List {
        /// Order by field (e.g., id_desc, account_asc)
        #[arg(short = 'o', long, default_value = "id_desc")]
        order_by: String,
        /// Page number
        #[arg(short, long, default_value = "1")]
        page: u32,
        /// Results per page
        #[arg(short = 'n', long, default_value = "20")]
        limit: u32,
    },
    /// Get user details
    Get {
        /// User ID
        id: i64,
    },
    /// Create a new user
    Create {
        /// Account name (required)
        #[arg(short, long)]
        account: String,
        /// Real name (required)
        #[arg(short, long)]
        realname: String,
        /// Password (required)
        #[arg(short, long)]
        password: String,
        /// Dry run
        #[arg(long)]
        dry_run: bool,
    },
    /// Update a user
    Update {
        /// User ID
        id: i64,
        /// Real name
        #[arg(short, long)]
        realname: Option<String>,
        /// Password
        #[arg(short, long)]
        password: Option<String>,
        /// Email
        #[arg(short = 'e', long)]
        email: Option<String>,
        /// Phone
        #[arg(short = 'p', long)]
        phone: Option<String>,
        /// Role
        #[arg(short = 'r', long)]
        role: Option<String>,
        /// Dry run
        #[arg(long)]
        dry_run: bool,
    },
    /// Delete a user
    Delete {
        /// User ID
        id: i64,
        /// Skip confirmation
        #[arg(long)]
        yes: bool,
        /// Dry run
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
                "/executions?pageID={}&recPerPage={}",
                page, limit
            );
            if let Some(p) = project {
                path = format!("/projects/{}/executions?pageID={}&recPerPage={}", p, page, limit);
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
                format!("/products/{}/stories?pageID={}&recPerPage={}", p, page, limit)
            } else {
                format!("/stories?pageID={}&recPerPage={}", page, limit)
            };
            let data = ac.get(&path)?;
            utils::print_table(&data, &["id", "title", "status", "pri", "productName", "openedDate"]);
            Ok(())
        }),
        StoryCommands::Get { id } => with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
            let data = ac.get(&format!("/stories/{}", id))?;
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

pub fn handle_bug(
    client: &Client,
    auth: &Rc<RefCell<AuthManager>>,
    cmd: &BugCommands,
) -> Result<(), String> {
    match cmd {
        BugCommands::List { product, page, limit } => with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
            let path = if let Some(p) = product {
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
                format!("/products/{}/testcases?pageID={}&recPerPage={}", p, page, limit)
            } else {
                format!("/testcases?pageID={}&recPerPage={}", page, limit)
            };
            let data = ac.get(&path)?;
            utils::print_table(&data, &["id", "title", "status", "pri", "type", "stage"]);
            Ok(())
        }),
        TestcaseCommands::Get { id } => with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
            let data = ac.get(&format!("/testcases/{}", id))?;
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

// ── Application System ──

#[derive(Subcommand)]
pub enum SystemCommands {
    /// List systems for a product
    List {
        /// Product ID
        #[arg(short, long)]
        product: i32,
        /// Page number
        #[arg(short = 'p', long, default_value = "1")]
        page: u32,
        /// Records per page
        #[arg(short = 'r', long, default_value = "20")]
        limit: u32,
    },
    /// Create a new system
    Create {
        /// System name (required)
        #[arg(long)]
        name: String,
        /// System code
        #[arg(long)]
        code: Option<String>,
        /// System key
        #[arg(long)]
        key: Option<String>,
        /// Description
        #[arg(long)]
        desc: Option<String>,
        /// System type
        #[arg(long)]
        r#type: Option<String>,
        /// Dry run
        #[arg(long)]
        dry_run: bool,
    },
    /// Update a system
    Update {
        /// System ID
        id: i32,
        /// System name
        #[arg(long)]
        name: Option<String>,
        /// System key
        #[arg(long)]
        key: Option<String>,
        /// Description
        #[arg(long)]
        desc: Option<String>,
        /// System type
        #[arg(long)]
        r#type: Option<String>,
        /// Dry run
        #[arg(long)]
        dry_run: bool,
    },
}

pub fn handle_system(
    client: &Client,
    auth: &Rc<RefCell<AuthManager>>,
    cmd: &SystemCommands,
) -> Result<(), String> {
    match cmd {
        SystemCommands::List {
            product,
            page,
            limit,
        } => {
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let data = ac.get(&format!(
                    "/products/{}/systems?pageID={}&recPerPage={}",
                    product, page, limit
                ))?;
                utils::print_table(&data, &["id", "name", "code", "type", "desc"]);
                Ok(())
            })
        }
        SystemCommands::Create {
            name,
            code,
            key,
            desc,
            r#type,
            dry_run,
        } => {
            if *dry_run {
                println!("🔍 [DRY-RUN] 创建系统: name={}", name);
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({"name": name});
                if let Some(c) = code {
                    body["code"] = json!(c);
                }
                if let Some(k) = key {
                    body["key"] = json!(k);
                }
                if let Some(d) = desc {
                    body["desc"] = json!(d);
                }
                if let Some(t) = r#type {
                    body["type"] = json!(t);
                }
                let result = ac.post("/systems", &body)?;
                println!("✅ 系统创建成功");
                utils::print_json(&result);
                Ok(())
            })
        }
        SystemCommands::Update {
            id,
            name,
            key,
            desc,
            r#type,
            dry_run,
        } => {
            if *dry_run {
                println!("🔍 [DRY-RUN] 更新系统 #{}", id);
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({});
                if let Some(n) = name {
                    body["name"] = json!(n);
                }
                if let Some(k) = key {
                    body["key"] = json!(k);
                }
                if let Some(d) = desc {
                    body["desc"] = json!(d);
                }
                if let Some(t) = r#type {
                    body["type"] = json!(t);
                }
                let result = ac.put(&format!("/systems/{}", id), &body)?;
                println!("✅ 系统 #{} 更新成功", id);
                utils::print_json(&result);
                Ok(())
            })
        }
    }
}

// ── Product ──

#[derive(Subcommand)]
pub enum ProductCommands {
    /// List products
    List {
        /// Browse type (unclosed, all, etc.)
        #[arg(short = 'b', long, default_value = "all")]
        browse_type: String,
        /// Order by field (e.g., id_desc, name_asc)
        #[arg(short = 'o', long, default_value = "id_desc")]
        order_by: String,
        /// Page number
        #[arg(short, long, default_value = "1")]
        page: u32,
        /// Records per page
        #[arg(short = 'n', long, default_value = "20")]
        limit: u32,
    },
    /// Get product details
    Get {
        /// Product ID
        id: i64,
    },
    /// Create a new product
    Create {
        /// Product name (required)
        #[arg(short, long)]
        name: String,
        /// Product code (required)
        #[arg(short, long)]
        code: String,
        /// Program/Project ID
        #[arg(long)]
        program: Option<i64>,
        /// Line ID
        #[arg(long)]
        line: Option<i64>,
        /// Product type (normal, multi-branch, platform, etc.)
        #[arg(short, long, default_value = "normal")]
        r#type: String,
        /// Status (normal, closed)
        #[arg(short, long, default_value = "normal")]
        status: Option<String>,
        /// Product Owner
        #[arg(long)]
        po: Option<String>,
        /// QA Director
        #[arg(long)]
        qd: Option<String>,
        /// R&D Director
        #[arg(long)]
        rd: Option<String>,
        /// Reviewers
        #[arg(long)]
        reviewer: Option<String>,
        /// Description
        #[arg(short, long)]
        desc: Option<String>,
        /// ACL type (open, private, custom)
        #[arg(long)]
        acl: Option<String>,
        /// Whitelist users (comma-separated)
        #[arg(long, value_delimiter = ',')]
        whitelist: Option<Vec<String>>,
        /// Dry run
        #[arg(long)]
        dry_run: bool,
    },
    /// Update a product
    Update {
        /// Product ID
        id: i64,
        /// Product name
        #[arg(short, long)]
        name: Option<String>,
        /// Product code
        #[arg(short, long)]
        code: Option<String>,
        /// Program/Project ID
        #[arg(long)]
        program: Option<i64>,
        /// Line ID
        #[arg(long)]
        line: Option<i64>,
        /// Product type (normal, multi-branch, platform, etc.)
        #[arg(short, long)]
        r#type: Option<String>,
        /// Status (normal, closed)
        #[arg(short, long)]
        status: Option<String>,
        /// Product Owner
        #[arg(long)]
        po: Option<String>,
        /// QA Director
        #[arg(long)]
        qd: Option<String>,
        /// R&D Director
        #[arg(long)]
        rd: Option<String>,
        /// Reviewers
        #[arg(long)]
        reviewer: Option<String>,
        /// Description
        #[arg(short, long)]
        desc: Option<String>,
        /// ACL type (open, private, custom)
        #[arg(long)]
        acl: Option<String>,
        /// Whitelist users (comma-separated)
        #[arg(long, value_delimiter = ',')]
        whitelist: Option<Vec<String>>,
        /// Dry run
        #[arg(long)]
        dry_run: bool,
    },
    /// Delete a product
    Delete {
        /// Product ID
        id: i64,
        /// Skip confirmation
        #[arg(long)]
        yes: bool,
        /// Dry run
        #[arg(long)]
        dry_run: bool,
    },
    /// List products by program
    ListByProgram {
        /// Program ID
        #[arg(short, long)]
        program: i64,
        /// Page number
        #[arg(short, long, default_value = "1")]
        page: u32,
        /// Records per page
        #[arg(short = 'n', long, default_value = "20")]
        limit: u32,
    },
}

// ── Project ──

#[derive(Subcommand)]
pub enum ProjectCommands {
    /// List projects
    List {
        /// Browse type (unclosed, all, etc.)
        #[arg(short = 'b', long, default_value = "all")]
        browse_type: String,
        /// Order by field (e.g., id_desc, name_asc)
        #[arg(short = 'o', long, default_value = "id_desc")]
        order_by: String,
        /// Page number
        #[arg(short, long, default_value = "1")]
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
        #[arg(short, long, default_value = "1")]
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
        /// Project type (sprint, stage, kanban, etc.)
        #[arg(short, long, default_value = "sprint")]
        r#type: String,
        /// Parent project ID
        #[arg(long)]
        parent: Option<i64>,
        /// Begin date (YYYY-MM-DD)
        #[arg(long)]
        begin: Option<String>,
        /// End date (YYYY-MM-DD)
        #[arg(long)]
        end: Option<String>,
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
        /// Project name
        #[arg(short, long)]
        name: Option<String>,
        /// Project code
        #[arg(short, long)]
        code: Option<String>,
        /// Project type (sprint, stage, kanban, etc.)
        #[arg(short, long)]
        r#type: Option<String>,
        /// Parent project ID
        #[arg(long)]
        parent: Option<i64>,
        /// Begin date (YYYY-MM-DD)
        #[arg(long)]
        begin: Option<String>,
        /// End date (YYYY-MM-DD)
        #[arg(long)]
        end: Option<String>,
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

pub fn handle_product(
    client: &Client,
    auth: &Rc<RefCell<AuthManager>>,
    cmd: &ProductCommands,
) -> Result<(), String> {
    match cmd {
        ProductCommands::List {
            browse_type,
            order_by,
            page,
            limit,
        } => {
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let data = ac.get(&format!(
                    "/products?browseType={}&orderBy={}&recPerPage={}&pageID={}",
                    browse_type, order_by, limit, page
                ))?;
                utils::print_table(
                    &data,
                    &["id", "name", "code", "status", "PO", "QD", "RD", "type"],
                );
                Ok(())
            })
        }
        ProductCommands::Get { id } => {
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let data = ac.get(&format!("/products/{}", id))?;
                utils::print_json(&data);
                Ok(())
            })
        }
        ProductCommands::Create {
            name,
            code,
            program,
            line,
            r#type,
            status,
            po,
            qd,
            rd,
            reviewer,
            desc,
            acl,
            whitelist,
            dry_run,
        } => {
            if *dry_run {
                println!(
                    "🔍 [DRY-RUN] 创建产品: name={}, code={}",
                    name, code
                );
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({
                    "name": name,
                    "code": code,
                });
                if let Some(v) = program {
                    body["program"] = json!(v);
                }
                if let Some(v) = line {
                    body["line"] = json!(v);
                }
                body["type"] = json!(r#type);
                if let Some(v) = status {
                    body["status"] = json!(v);
                }
                if let Some(v) = po {
                    body["PO"] = json!(v);
                }
                if let Some(v) = qd {
                    body["QD"] = json!(v);
                }
                if let Some(v) = rd {
                    body["RD"] = json!(v);
                }
                if let Some(v) = reviewer {
                    body["reviewer"] = json!(v);
                }
                if let Some(v) = desc {
                    body["desc"] = json!(v);
                }
                if let Some(v) = acl {
                    body["acl"] = json!(v);
                }
                if let Some(v) = whitelist {
                    body["whitelist"] = json!(v);
                }
                let result = ac.post("/products", &body)?;
                println!("✅ 产品创建成功");
                utils::print_json(&result);
                Ok(())
            })
        }
        ProductCommands::Update {
            id,
            name,
            code,
            program,
            line,
            r#type,
            status,
            po,
            qd,
            rd,
            reviewer,
            desc,
            acl,
            whitelist,
            dry_run,
        } => {
            if *dry_run {
                println!("🔍 [DRY-RUN] 更新产品 #{}", id);
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
                if let Some(v) = program {
                    body["program"] = json!(v);
                }
                if let Some(v) = line {
                    body["line"] = json!(v);
                }
                if let Some(v) = r#type {
                    body["type"] = json!(v);
                }
                if let Some(v) = status {
                    body["status"] = json!(v);
                }
                if let Some(v) = po {
                    body["PO"] = json!(v);
                }
                if let Some(v) = qd {
                    body["QD"] = json!(v);
                }
                if let Some(v) = rd {
                    body["RD"] = json!(v);
                }
                if let Some(v) = reviewer {
                    body["reviewer"] = json!(v);
                }
                if let Some(v) = desc {
                    body["desc"] = json!(v);
                }
                if let Some(v) = acl {
                    body["acl"] = json!(v);
                }
                if let Some(v) = whitelist {
                    body["whitelist"] = json!(v);
                }
                let result = ac.put(&format!("/products/{}", id), &body)?;
                println!("✅ 产品 #{} 更新成功", id);
                utils::print_json(&result);
                Ok(())
            })
        }
        ProductCommands::Delete { id, yes, dry_run } => {
            if !yes && !*dry_run {
                println!("⚠️  确认删除产品 #{}? 使用 --yes 确认", id);
                return Ok(());
            }
            if *dry_run {
                println!("🔍 [DRY-RUN] 删除产品 #{}", id);
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let result = ac.delete(&format!("/products/{}", id))?;
                println!("✅ 产品 #{} 已删除", id);
                utils::print_json(&result);
                Ok(())
            })
        }
        ProductCommands::ListByProgram {
            program,
            page,
            limit,
        } => {
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let data = ac.get(&format!(
                    "/programs/{}/products?pageID={}&recPerPage={}",
                    program, page, limit
                ))?;
                utils::print_table(
                    &data,
                    &["id", "name", "code", "status", "PO", "type"],
                );
                Ok(())
            })
        }
    }
}

// ── Project handler ──

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
            r#type,
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
                println!(
                    "🔍 [DRY-RUN] 创建项目: name={}, code={}",
                    name, code
                );
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({
                    "name": name,
                    "code": code,
                });
                body["type"] = json!(r#type);
                body["status"] = json!(status);
                if let Some(v) = parent {
                    body["parent"] = json!(v);
                }
                if let Some(v) = begin {
                    body["begin"] = json!(v);
                }
                if let Some(v) = end {
                    body["end"] = json!(v);
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
            r#type,
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
                println!("🔍 [DRY-RUN] 更新项目 #{}", id);
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
                if let Some(v) = r#type {
                    body["type"] = json!(v);
                }
                if let Some(v) = parent {
                    body["parent"] = json!(v);
                }
                if let Some(v) = begin {
                    body["begin"] = json!(v);
                }
                if let Some(v) = end {
                    body["end"] = json!(v);
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

// ── File / Attachment ──

#[derive(Subcommand)]
pub enum FileCommands {
    /// Upload a file
    Upload {
        /// Path to the file to upload
        #[arg(short, long)]
        file: String,
        /// Optional title/name for the file
        #[arg(long)]
        title: Option<String>,
        /// Object type (story, task, bug, etc.)
        #[arg(short = 't', long)]
        object_type: Option<String>,
        /// Object ID
        #[arg(short = 'i', long)]
        object_id: Option<i64>,
    },
    /// Edit/rename a file
    Edit {
        /// File ID
        #[arg(short, long)]
        id: i64,
        /// New title/name
        #[arg(short, long)]
        title: String,
    },
    /// Delete a file
    Delete {
        /// File ID
        #[arg(short, long)]
        id: i64,
        /// Skip confirmation
        #[arg(long)]
        yes: bool,
    },
}

pub fn handle_file(
    client: &Client,
    auth: &Rc<RefCell<AuthManager>>,
    cmd: &FileCommands,
) -> Result<(), String> {
    match cmd {
        FileCommands::Upload {
            file,
            title,
            object_type,
            object_id,
        } => with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
            let mut fields: Vec<(&str, &str)> = Vec::new();
            if let Some(t) = title {
                fields.push(("title", t.as_str()));
            }
            if let Some(ot) = object_type {
                fields.push(("objectType", ot.as_str()));
            }
            let object_id_str;
            if let Some(oi) = object_id {
                object_id_str = oi.to_string();
                fields.push(("objectId", &object_id_str));
            }
            let result = ac.post_multipart("/files", &fields, "file", file, None)?;
            println!("✅ 文件上传成功");
            utils::print_json(&result);
            Ok(())
        }),
        FileCommands::Edit { id, title } => with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
            let body = serde_json::json!({ "title": title });
            let result = ac.put(&format!("/files/{}", id), &body)?;
            println!("✅ 文件 #{} 已重命名", id);
            utils::print_json(&result);
            Ok(())
        }),
        FileCommands::Delete { id, yes } => {
            if !yes {
                println!("⚠️  确认删除文件 #{}? 使用 --yes 确认", id);
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let result = ac.delete(&format!("/files/{}", id))?;
                println!("✅ 文件 #{} 已删除", id);
                utils::print_json(&result);
                Ok(())
            })
        }
    }
}

// ── User ──

pub fn handle_user(
    client: &Client,
    auth: &Rc<RefCell<AuthManager>>,
    cmd: &UserCommands,
) -> Result<(), String> {
    match cmd {
        UserCommands::List {
            order_by,
            page,
            limit,
        } => with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
            let data = ac.get(&format!(
                "/users?orderBy={}&recPerPage={}&pageID={}",
                order_by, limit, page
            ))?;
            utils::print_table(
                &data,
                &["id", "account", "realname", "email", "phone", "role", "status"],
            );
            Ok(())
        }),
        UserCommands::Get { id } => with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
            let data = ac.get(&format!("/users/{}", id))?;
            utils::print_json(&data);
            Ok(())
        }),
        UserCommands::Create {
            account,
            realname,
            password,
            dry_run,
        } => {
            if *dry_run {
                println!(
                    "🔍 [DRY-RUN] 创建用户: account={}, realname={}",
                    account, realname
                );
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let body = json!({
                    "account": account,
                    "realname": realname,
                    "password": password,
                });
                let result = ac.post("/users", &body)?;
                println!("✅ 用户创建成功");
                utils::print_json(&result);
                Ok(())
            })
        }
        UserCommands::Update {
            id,
            realname,
            password,
            email,
            phone,
            role,
            dry_run,
        } => {
            if *dry_run {
                println!("🔍 [DRY-RUN] 更新用户 #{}", id);
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({});
                if let Some(v) = realname {
                    body["realname"] = json!(v);
                }
                if let Some(v) = password {
                    body["password"] = json!(v);
                }
                if let Some(v) = email {
                    body["email"] = json!(v);
                }
                if let Some(v) = phone {
                    body["phone"] = json!(v);
                }
                if let Some(v) = role {
                    body["role"] = json!(v);
                }
                let result = ac.put(&format!("/users/{}", id), &body)?;
                println!("✅ 用户 #{} 更新成功", id);
                utils::print_json(&result);
                Ok(())
            })
        }
        UserCommands::Delete { id, yes, dry_run } => {
            if !yes && !dry_run {
                println!("⚠️  确认删除用户 #{}? 使用 --yes 确认", id);
                return Ok(());
            }
            if *dry_run {
                println!("🔍 [DRY-RUN] 删除用户 #{}", id);
                return Ok(());
            }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let result = ac.delete(&format!("/users/{}", id))?;
                println!("✅ 用户 #{} 已删除", id);
                utils::print_json(&result);
                Ok(())
            })
        }
    }
}

// ── Program (项目集) ──

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
        #[arg(short, long, default_value = "1")]
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

// ── Program handler ──

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

// ── Build / Version ──

#[derive(Subcommand)]
pub enum BuildCommands {
    /// List builds by project
    ListByProject {
        /// Project ID
        #[arg(short, long)]
        project: i64,
        /// Page number
        #[arg(short, long, default_value = "1")]
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
        #[arg(short, long, default_value = "1")]
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

// ── Release ──

#[derive(Subcommand)]
pub enum ReleaseCommands {
    /// List releases by product
    ListByProduct {
        /// Product ID
        #[arg(short, long)]
        product: i64,
        /// Page number
        #[arg(short, long, default_value = "1")]
        page: u32,
        /// Records per page
        #[arg(short = 'n', long, default_value = "20")]
        limit: u32,
    },
    /// List all releases (general list)
    List {
        /// Page number
        #[arg(short, long, default_value = "1")]
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
                    "product": product,
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

// ── Product Plans ──

#[derive(Subcommand)]
pub enum ProductplanCommands {
    /// List plans by product
    ListByProduct {
        /// Product ID
        #[arg(short, long)]
        product: i64,
        /// Page number
        #[arg(short, long, default_value = "1")]
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
        ProductplanCommands::ListByProduct {
            product,
            page,
            limit,
        } => {
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
                    "product": product,
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
