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
pub enum TestcaseCommands {
    /// List test cases
    List {
        /// Product ID
        #[arg(short = 'p', long)]
        product: Option<i64>,
        /// Project ID
        #[arg(short = 'j', long)]
        project: Option<i64>,
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
        #[arg(short = 'y', long, default_value = "feature")]
        r#type: String,
        /// Stage (unit/feature/intergr/system/accept/others)
        #[arg(short, long, default_value = "feature")]
        stage: String,
        /// Priority (1-4)
        #[arg(short = 'i', long)]
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
        /// Priority (1-4)
        #[arg(short = 'i', long)]
        pri: Option<u8>,
        /// Type (feature/performance/config/interface/security/other/unit/install)
        #[arg(short = 'y', long)]
        r#type: Option<String>,
        /// Module ID
        #[arg(short = 'm', long)]
        module: Option<i64>,
        /// Preconditions
        #[arg(long)]
        precondition: Option<String>,
        /// Steps (JSON array of {step,expect})
        #[arg(long)]
        steps: Option<String>,
        /// Story ID
        #[arg(long)]
        story: Option<i64>,
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


pub fn handle_testcase(
    client: &Client,
    auth: &Rc<RefCell<AuthManager>>,
    cmd: &TestcaseCommands,
) -> Result<(), String> {
    match cmd {
        TestcaseCommands::List { product, project, execution, page, limit } => with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
            let path = if let Some(e) = execution {
                format!("/executions/{}/testcases?pageID={}&recPerPage={}", e, page, limit)
            } else if let Some(j) = project {
                format!("/projects/{}/testcases?pageID={}&recPerPage={}", j, page, limit)
            } else if let Some(p) = product {
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
                    "productID": product,
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
        TestcaseCommands::Update { id, title, status, pri, r#type, module, precondition, steps, story, dry_run } => {
            if *dry_run { println!("🔍 [DRY-RUN] 更新测试用例 #{}", id); return Ok(()); }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({});
                if let Some(t) = title { body["title"] = json!(t); }
                if let Some(s) = status { body["status"] = json!(s); }
                if let Some(p) = pri { body["pri"] = json!(p); }
                if let Some(t) = r#type { body["type"] = json!(t); }
                if let Some(m) = module { body["module"] = json!(m); }
                if let Some(pc) = precondition { body["precondition"] = json!(pc); }
                if let Some(s) = story { body["story"] = json!(s); }
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
                        body["stepType"] = json!(vec!["step"; step_strs.len()]);
                    } else {
                        body["steps"] = json!([s]);
                        body["expects"] = json!([""]);
                        body["stepType"] = json!(["step"]);
                    }
                }
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

