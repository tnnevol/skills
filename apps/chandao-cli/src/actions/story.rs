use clap::Subcommand;
use serde_json::json;
use std::cell::RefCell;
use std::rc::Rc;

use crate::auth::AuthManager;
use crate::client::{AuthenticatedClient, Client};
use crate::markdown::markdown_to_html;
use crate::utils;

macro_rules! with_auth {
    ($client:expr, $auth:expr, $body:expr) => {{
        let mut ac = $client.authenticate($auth)?;
        $body(&mut ac)
    }};
}

#[derive(Subcommand)]
pub enum StoryCommands {
    /// List stories
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
        /// Browse type (all/unclosed/bysearch)
        #[arg(short = 'b', long, default_value = "all")]
        browse_type: String,
        /// Order by
        #[arg(short = 'o', long, default_value = "id_desc")]
        order_by: String,
        /// Page
        #[arg(short = 'g', long, default_value = "1")]
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
        #[arg(short = 'S', long)]
        spec: Option<String>,
        /// Verification criteria
        #[arg(long)]
        verify: Option<String>,
        /// Module ID
        #[arg(short = 'm', long)]
        module: Option<i64>,
        /// Parent story ID
        #[arg(long)]
        parent: Option<i64>,
        /// Priority (1-4)
        #[arg(short = 'i', long)]
        pri: Option<u8>,
        /// Category (feature/interface/performance/safe/experience/improve/other)
        #[arg(short = 'c', long)]
        category: Option<String>,
        /// Source
        #[arg(short = 'o', long)]
        source: Option<String>,
        /// Assigned to
        #[arg(short = 'a', long)]
        assigned: Option<String>,
        /// Reviewer
        #[arg(short = 'r', long)]
        reviewer: Option<String>,
        /// Estimate (hours)
        #[arg(long)]
        estimate: Option<f64>,
        /// Project ID
        #[arg(short = 'j', long)]
        project: Option<i64>,
        /// Execution ID
        #[arg(short = 'e', long)]
        execution: Option<i64>,
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
        /// Specification
        #[arg(short = 'S', long)]
        spec: Option<String>,
        #[arg(short = 'm', long)]
        module: Option<i64>,
        /// Parent story ID
        #[arg(long)]
        parent: Option<i64>,
        #[arg(short = 'i', long)]
        pri: Option<u8>,
        /// Category (feature/interface/performance/safe/experience/improve/other)
        #[arg(short = 'c', long)]
        category: Option<String>,
        /// Source
        #[arg(short = 'o', long)]
        source: Option<String>,
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
        /// Reason: done, subdivided, duplicate, postponed, willnotdo, cancel, bydesign
        #[arg(short, long)]
        reason: String,
        #[arg(long)]
        dry_run: bool,
    },
    /// Activate a closed story
    Activate {
        id: i64,
        /// Assigned to
        #[arg(short = 'a', long)]
        assigned: Option<String>,
        /// Comment
        #[arg(short, long)]
        comment: Option<String>,
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

pub fn handle_story(
    client: &Client,
    auth: &Rc<RefCell<AuthManager>>,
    cmd: &StoryCommands,
) -> Result<(), String> {
    match cmd {
        StoryCommands::List { product, project, execution, browse_type, order_by, page, limit } => with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
            let path = if let Some(e) = execution {
                format!("/executions/{}/stories?browseType={}&orderBy={}&pageID={}&recPerPage={}", e, browse_type, order_by, page, limit)
            } else if let Some(p) = project {
                format!("/projects/{}/stories?browseType={}&orderBy={}&pageID={}&recPerPage={}", p, browse_type, order_by, page, limit)
            } else if let Some(p) = product {
                format!("/products/{}/stories?browseType={}&orderBy={}&pageID={}&recPerPage={}", p, browse_type, order_by, page, limit)
            } else {
                format!("/stories?browseType={}&orderBy={}&pageID={}&recPerPage={}", browse_type, order_by, page, limit)
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
        StoryCommands::Create { product, title, spec, verify, module, parent, pri, category, source, assigned, reviewer, estimate, project, execution, dry_run } => {
            if *dry_run { println!("🔍 [DRY-RUN] 创建需求: {}", title); return Ok(()); }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({"productID": product, "title": title});
                if let Some(d) = spec { body["spec"] = json!(markdown_to_html(&d)); }
                if let Some(v) = verify { body["verify"] = json!(markdown_to_html(&v)); }
                if let Some(m) = module { body["module"] = json!(m); }
                if let Some(pa) = parent { body["parent"] = json!(pa); }
                if let Some(p) = pri { body["pri"] = json!(p); }
                if let Some(c) = category { body["category"] = json!(c); }
                if let Some(s) = source { body["source"] = json!(s); }
                if let Some(a) = assigned { body["assignedTo"] = json!(a); }
                if let Some(e) = estimate { body["estimate"] = json!(e); }
                if let Some(j) = project { body["project"] = json!(j); }
                if let Some(ex) = execution { body["execution"] = json!(ex); }
                if let Some(r) = reviewer { body["reviewer"] = json!(r); }
                let result = ac.post("/stories", &body)?;
                println!("✅ 需求创建成功");
                utils::print_json(&result);
                Ok(())
            })
        }
        StoryCommands::Update { id, title, spec, module, parent, pri, category, source, assigned, status, dry_run } => {
            if *dry_run { println!("🔍 [DRY-RUN] 更新需求 #{}", id); return Ok(()); }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({});
                if let Some(t) = title { body["title"] = json!(t); }
                if let Some(s) = spec { body["spec"] = json!(markdown_to_html(&s)); }
                if let Some(m) = module { body["module"] = json!(m); }
                if let Some(pa) = parent { body["parent"] = json!(pa); }
                if let Some(p) = pri { body["pri"] = json!(p); }
                if let Some(c) = category { body["category"] = json!(c); }
                if let Some(s) = source { body["source"] = json!(s); }
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
                let body = json!({"closedReason": reason});
                ac.put(&format!("/stories/{}/close", id), &body)?;
                println!("✅ 需求 #{} 已关闭", id);
                Ok(())
            })
        }
        StoryCommands::Activate { id, assigned, comment, dry_run } => {
            if *dry_run { println!("🔍 [DRY-RUN] 激活需求 #{}", id); return Ok(()); }
            with_auth!(client, auth, |ac: &mut AuthenticatedClient| {
                let mut body = json!({});
                if let Some(a) = assigned { body["assignedTo"] = json!(a); }
                if let Some(c) = comment { body["comment"] = json!(c); }
                ac.put(&format!("/stories/{}/activate", id), &body)?;
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
                if let Some(s) = spec { body["spec"] = json!(markdown_to_html(&s)); }
                if let Some(v) = verify { body["verify"] = json!(markdown_to_html(&v)); }
                let result = ac.put(&format!("/stories/{}/change", id), &body)?;
                println!("✅ 需求 #{} 已提交变更", id);
                utils::print_json(&result);
                Ok(())
            })
        }
    }
}
