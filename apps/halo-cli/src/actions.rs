//! CLI action implementations.
use clap::Parser;
use serde_json::{json, Value};

use crate::client::Client;
use crate::markdown;
use crate::utils;

/// List posts.
pub fn action_list(client: &Client, args: &ListArgs) -> Result<(), String> {
    let mut api_path = format!("{}?page={}&size={}", client.ext_posts_api(), args.page, args.limit);
    if let Some(ref keyword) = args.keyword {
        api_path.push_str(&format!("&keyword={}", keyword));
    }

    let resp = client.do_request("GET", &api_path, None)?;
    let data: Value = serde_json::from_slice(&resp.body).map_err(|e| format!("解析响应失败: {}", e))?;

    let items = data.get("items").and_then(|v| v.as_array()).cloned().unwrap_or_default();
    let total = utils::get_f64(&data, "total");

    if items.is_empty() {
        println!("📭 没有找到文章。");
        return Ok(());
    }

    println!("\n📄 文章列表（共 {} 篇，第 {} 页）\n", total as usize, args.page);

    for item in &items {
        let Some(post) = item.as_object() else { continue };
        let post = Value::Object(post.clone());

        let spec = utils::get_obj(&post, "spec");
        let meta = utils::get_obj(&post, "metadata");
        let status = utils::get_obj(&post, "status");

        let badge = if spec.map(|s| utils::get_str(s, "publish") == "true").unwrap_or(false) {
            "✅ 已发布"
        } else {
            "📝 草稿"
        };

        let title = spec.map(|s| utils::get_str(s, "title")).unwrap_or_default();
        let title = if title.is_empty() { "(无标题)" } else { &title };

        let publish_time = spec
            .map(|s| utils::get_str(s, "publishTime"))
            .unwrap_or_default();
        let date = if publish_time.is_empty() {
            meta.map(|m| utils::get_str(m, "creationTimestamp")).unwrap_or_default()
        } else {
            publish_time
        };
        let date = utils::format_time(&date);

        let name = meta.map(|m| utils::get_str(m, "name")).unwrap_or_default();
        let visit_count = status.map(|s| utils::get_f64(s, "visitCount")).unwrap_or(0.0);
        let visible = spec.map(|s| utils::get_str(s, "visible")).unwrap_or_default();
        let visible = if visible.is_empty() { "PUBLIC" } else { &visible };
        let link = utils::build_post_link(&client.base_url, &post);

        println!("  {} | {}", badge, visible);
        println!("  标题: {}", title);
        println!("  名称: {}", name);
        if !date.is_empty() {
            println!("  时间: {}", date);
        }
        println!("  阅读: {}", visit_count as usize);
        println!("  链接: {}", link);
        println!("{}", "─".repeat(50));
    }

    let has_next = data.get("hasNext").and_then(|v| v.as_bool()).unwrap_or(false);
    if has_next || (total as usize) > args.page * args.limit {
        println!("\n💡 使用 --page={} 查看下一页", args.page + 1);
    }

    Ok(())
}

/// Get post detail.
pub fn action_get(client: &Client, args: &GetArgs) -> Result<(), String> {
    let api_path = format!("{}/{}", client.ext_posts_api(), args.name);
    let resp = client.do_request("GET", &api_path, None)?;
    let data: Value = serde_json::from_slice(&resp.body).map_err(|e| format!("解析响应失败: {}", e))?;

    let spec = utils::get_obj(&data, "spec");
    let meta = utils::get_obj(&data, "metadata");

    let title = spec.map(|s| utils::get_str(s, "title")).unwrap_or_default();
    let name = meta.map(|m| utils::get_str(m, "name")).unwrap_or_default();
    let visible = spec.map(|s| utils::get_str(s, "visible")).unwrap_or_default();
    let publish_time = spec.map(|s| utils::get_str(s, "publishTime")).unwrap_or_default();
    let date = utils::format_time(&publish_time);
    let link = utils::build_post_link(&client.base_url, &data);

    println!("\n📋 文章详情");
    println!("  标题: {}", title);
    println!("  名称: {}", name);
    if !visible.is_empty() {
        println!("  可见性: {}", visible);
    }
    if !date.is_empty() {
        println!("  时间: {}", date);
    }
    println!("  链接: {}", link);

    Ok(())
}

/// Create a new post.
pub fn action_create(client: &Client, args: &CreateArgs) -> Result<(), String> {
    if args.title.is_empty() {
        return Err("用法: halo create --title=标题 [--raw=内容] [--slug=xxx] [--publish] [--public]".to_string());
    }

    let visible = if args.public { "PUBLIC" } else { "PRIVATE" };
    let slug = if args.slug.is_empty() {
        utils::slugify(&args.title)
    } else {
        args.slug.clone()
    };

    // Process content
    let (final_raw, final_content, raw_type) = if !args.raw.is_empty() && args.content.is_empty() {
        let html = markdown::md_to_html(&args.raw);
        (html.clone(), html, "HTML")
    } else if args.raw.is_empty() && !args.content.is_empty() {
        (args.content.clone(), args.content.clone(), "HTML")
    } else if !args.raw.is_empty() && !args.content.is_empty() {
        (args.content.clone(), args.content.clone(), "HTML")
    } else {
        (String::new(), String::new(), "HTML")
    };

    let post_name = format!("{}-{}", slug, chrono_timestamp());

    let post_request = json!({
        "post": {
            "apiVersion": "content.halo.run/v1alpha1",
            "kind": "Post",
            "metadata": {
                "name": post_name,
                "labels": {},
                "annotations": {}
            },
            "spec": {
                "title": args.title,
                "slug": slug,
                "visible": visible,
                "publish": args.publish,
                "allowComment": true,
                "pinned": false,
                "cover": "",
                "template": "",
                "categories": [],
                "tags": [],
                "aliases": [],
                "meta": {
                    "labels": {},
                    "annotations": {}
                },
                "deprecated": false,
                "deleted": false,
                "priority": 0,
                "htmlMetas": [],
                "excerpt": {
                    "autoGenerate": true,
                    "raw": ""
                }
            }
        },
        "content": {
            "raw": final_raw,
            "content": final_content,
            "rawType": raw_type
        }
    });

    let resp = client.do_request("POST", client.console_posts_api(), Some(&post_request))?;
    let data: Value = serde_json::from_slice(&resp.body).map_err(|e| format!("解析响应失败: {}", e))?;

    let spec = utils::get_obj(&data, "spec");
    let meta = utils::get_obj(&data, "metadata");

    let resp_title = spec.map(|s| utils::get_str(s, "title")).unwrap_or_default();
    let resp_name = meta.map(|m| utils::get_str(m, "name")).unwrap_or_default();
    let resp_visible = spec.map(|s| utils::get_str(s, "visible")).unwrap_or_else(|| visible.to_string());
    let resp_version = meta.and_then(|m| m.get("version")).map(|v| v.to_string()).unwrap_or_default();
    let published = spec.map(|s| s.get("publish").and_then(|v| v.as_bool()).unwrap_or(false)).unwrap_or(false);
    let badge = if published { "✅ 已发布" } else { "📝 草稿（未发布）" };

    println!("\n✅ 文章创建成功");
    println!("  标题: {}", resp_title);
    println!("  名称: {}", resp_name);
    println!("  可见性: {}", resp_visible);
    println!("  格式: {}", raw_type);
    println!("  状态: {}", badge);
    println!("  版本: {}", resp_version);
    println!("  链接: {}", utils::build_post_link(&client.base_url, &data));

    if !published {
        println!("\n💡 使用 `halo publish {}` 发布文章", resp_name);
    }

    Ok(())
}

/// Update an existing post.
pub fn action_update(client: &Client, args: &UpdateArgs) -> Result<(), String> {
    if args.name.is_empty() {
        return Err("用法: halo update <name> [--title=xxx] [--raw=xxx] [--content=xxx]".to_string());
    }

    let api_path = format!("{}/{}", client.ext_posts_api(), args.name);

    // 1. Fetch current version for optimistic locking
    let resp = client.do_request("GET", &api_path, None)?;
    let current: Value = serde_json::from_slice(&resp.body).map_err(|e| format!("解析响应失败: {}", e))?;

    let current_spec = utils::get_obj(&current, "spec").ok_or("文章结构异常")?.clone();
    let current_meta = utils::get_obj(&current, "metadata").ok_or("文章结构异常")?.clone();

    // 2. If content needs updating, update it first via Console API
    if !args.raw.is_empty() || !args.content.is_empty() {
        let (raw_content, content_content) = if !args.raw.is_empty() && args.content.is_empty() {
            let html = markdown::md_to_html(&args.raw);
            (html.clone(), html)
        } else if args.raw.is_empty() && !args.content.is_empty() {
            (args.content.clone(), args.content.clone())
        } else {
            (args.content.clone(), args.content.clone())
        };

        let content_body = json!({
            "raw": raw_content,
            "content": content_content,
            "rawType": "HTML"
        });

        let content_path = format!("{}/{}/content", client.console_posts_api(), args.name);
        client.do_request("PUT", &content_path, Some(&content_body))?;

        // 3. Re-fetch latest version after content update (Console API bumps version)
        let resp = client.do_request("GET", &api_path, None)?;
        let current: Value = serde_json::from_slice(&resp.body).map_err(|e| format!("解析响应失败: {}", e))?;
        let current_spec = utils::get_obj(&current, "spec").ok_or("文章结构异常")?.clone();
        let current_meta = utils::get_obj(&current, "metadata").ok_or("文章结构异常")?.clone();

        // 4. Build flat-format Post for metadata update
        let mut updated_post = serde_json::Map::new();
        updated_post.insert("apiVersion".into(), current["apiVersion"].clone());
        updated_post.insert("kind".into(), current["kind"].clone());
        updated_post.insert("metadata".into(), current_meta);
        updated_post.insert("spec".into(), current_spec.clone());

        // Apply field updates
        if let Some(spec) = updated_post.get_mut("spec").and_then(|v| v.as_object_mut()) {
            if !args.title.is_empty() {
                spec.insert("title".into(), Value::String(args.title.clone()));
            }
            if !args.slug.is_empty() {
                spec.insert("slug".into(), Value::String(args.slug.clone()));
            }
            if !args.visible.is_empty() {
                spec.insert("visible".into(), Value::String(args.visible.clone()));
            }
            if let Some(ref cover) = args.cover {
                spec.insert("cover".into(), Value::String(cover.clone()));
            }
            if let Some(ref pinned) = args.pinned {
                spec.insert("pinned".into(), Value::Bool(*pinned));
            }
            clean_spec(spec);
        }

        // 5. PUT metadata update
        let data = client.do_request("PUT", &api_path, Some(&Value::Object(updated_post)))?;
        let data: Value = serde_json::from_slice(&data.body).map_err(|e| format!("解析响应失败: {}", e))?;

        // 6. Republish to refresh releaseSnapshot so frontend sees all updates
        let publish_path = format!("{}/{}/publish", client.console_posts_api(), args.name);
        client.do_request("PUT", &publish_path, None)?;

        let spec = utils::get_obj(&data, "spec");
        let meta = utils::get_obj(&data, "metadata");

        println!("\n✅ 文章更新成功");
        println!("  标题: {}", spec.map(|s| utils::get_str(s, "title")).unwrap_or_default());
        println!("  名称: {}", meta.map(|m| utils::get_str(m, "name")).unwrap_or_default());
        println!("  版本: {}", meta.and_then(|m| m.get("version")).map(|v| v.to_string()).unwrap_or_default());
        println!("  内容: 已更新");
        println!("  链接: {}", utils::build_post_link(&client.base_url, &data));
    } else {
        // Metadata-only update (no content change)
        let mut updated_post = serde_json::Map::new();
        updated_post.insert("apiVersion".into(), current["apiVersion"].clone());
        updated_post.insert("kind".into(), current["kind"].clone());
        updated_post.insert("metadata".into(), current_meta);
        updated_post.insert("spec".into(), current_spec.clone());

        if let Some(spec) = updated_post.get_mut("spec").and_then(|v| v.as_object_mut()) {
            if !args.title.is_empty() {
                spec.insert("title".into(), Value::String(args.title.clone()));
            }
            if !args.slug.is_empty() {
                spec.insert("slug".into(), Value::String(args.slug.clone()));
            }
            if !args.visible.is_empty() {
                spec.insert("visible".into(), Value::String(args.visible.clone()));
            }
            if let Some(ref cover) = args.cover {
                spec.insert("cover".into(), Value::String(cover.clone()));
            }
            if let Some(ref pinned) = args.pinned {
                spec.insert("pinned".into(), Value::Bool(*pinned));
            }
            clean_spec(spec);
        }

        let data = client.do_request("PUT", &api_path, Some(&Value::Object(updated_post)))?;
        let data: Value = serde_json::from_slice(&data.body).map_err(|e| format!("解析响应失败: {}", e))?;

        let spec = utils::get_obj(&data, "spec");
        let meta = utils::get_obj(&data, "metadata");

        println!("\n✅ 文章更新成功");
        println!("  标题: {}", spec.map(|s| utils::get_str(s, "title")).unwrap_or_default());
        println!("  名称: {}", meta.map(|m| utils::get_str(m, "name")).unwrap_or_default());
        println!("  版本: {}", meta.and_then(|m| m.get("version")).map(|v| v.to_string()).unwrap_or_default());
        println!("  链接: {}", utils::build_post_link(&client.base_url, &data));
    }

    Ok(())
}

/// Delete a post.
pub fn action_delete(client: &Client, args: &DeleteArgs) -> Result<(), String> {
    let api_path = format!("{}/{}", client.ext_posts_api(), args.name);
    let _ = client.do_request("DELETE", &api_path, None)?;
    println!("\n✅ 文章已删除: {}", args.name);
    Ok(())
}

/// Publish a post.
pub fn action_publish(client: &Client, args: &PublishArgs) -> Result<(), String> {
    let api_path = format!("{}/{}/publish", client.console_posts_api(), args.name);
    let _ = client.do_request("PUT", &api_path, None)?;
    println!("\n✅ 文章已发布: {}", args.name);
    Ok(())
}

/// Unpublish a post.
pub fn action_unpublish(client: &Client, args: &UnpublishArgs) -> Result<(), String> {
    let api_path = format!("{}/{}/unpublish", client.console_posts_api(), args.name);
    let _ = client.do_request("PUT", &api_path, None)?;
    println!("\n✅ 文章已取消发布: {}", args.name);
    Ok(())
}

// ── CLI argument structs ──────────────────────────────────────────────────

#[derive(Parser)]
pub struct ListArgs {
    #[arg(long, default_value = "20")]
    pub limit: usize,
    #[arg(long, default_value = "1")]
    pub page: usize,
    #[arg(long)]
    pub keyword: Option<String>,
}

#[derive(Parser)]
pub struct GetArgs {
    pub name: String,
}

#[derive(Parser)]
pub struct CreateArgs {
    #[arg(long)]
    pub title: String,
    #[arg(long, default_value = "")]
    pub raw: String,
    #[arg(long, default_value = "")]
    pub slug: String,
    #[arg(long, default_value = "")]
    pub content: String,
    #[arg(long, default_value_t = false)]
    pub publish: bool,
    #[arg(long, default_value_t = false)]
    pub public: bool,
}

#[derive(Parser)]
pub struct UpdateArgs {
    pub name: String,
    #[arg(long, default_value = "")]
    pub title: String,
    #[arg(long, default_value = "")]
    pub raw: String,
    #[arg(long, default_value = "")]
    pub content: String,
    #[arg(long, default_value = "")]
    pub slug: String,
    #[arg(long, default_value = "")]
    pub visible: String,
    #[arg(long)]
    pub cover: Option<String>,
    #[arg(long)]
    pub pinned: Option<bool>,
}

#[derive(Parser)]
pub struct DeleteArgs {
    pub name: String,
}

#[derive(Parser)]
pub struct PublishArgs {
    pub name: String,
}

#[derive(Parser)]
pub struct UnpublishArgs {
    pub name: String,
}

// ── Helpers ───────────────────────────────────────────────────────────────

fn chrono_timestamp() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let secs = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();
    // Format as YYYYMMDDHHmmss without separators
    let t = secs as i64;
    // Manual UTC time calculation (good enough for slug generation)
    let days = t / 86400;
    let time_of_day = (t % 86400) as u32;
    let hours = time_of_day / 3600;
    let minutes = (time_of_day % 3600) / 60;
    let seconds = time_of_day % 60;
    // Approximate date from days since epoch
    let mut year = 1970i64;
    let mut remaining_days = days;
    loop {
        let is_leap = year % 4 == 0 && (year % 100 != 0 || year % 400 == 0);
        let days_in_year = if is_leap { 366 } else { 365 };
        if remaining_days < days_in_year { break; }
        remaining_days -= days_in_year;
        year += 1;
    }
    let day_of_year = remaining_days + 1;
    let is_leap = year % 4 == 0 && (year % 100 != 0 || year % 400 == 0);
    let month_days = [31, if is_leap { 29 } else { 28 }, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let mut month = 0usize;
    let mut day = day_of_year;
    for (i, &md) in month_days.iter().enumerate() {
        if day <= md as i64 { month = i + 1; break; }
        day -= md as i64;
    }
    if month == 0 { month = 12; }
    format!("{:04}{:02}{:02}{:02}{:02}{:02}", year, month, day, hours, minutes, seconds)
}

fn clean_spec(spec: &mut serde_json::Map<String, Value>) {
    for key in &["slug", "cover", "template"] {
        if let Some(v) = spec.get(*key) {
            if v.as_str().map(|s| s.is_empty()).unwrap_or(false) {
                spec.remove(*key);
            }
        }
    }
}
