use halo_cli::utils::{build_post_link, format_time, get_f64, get_obj, get_str, slugify};

#[test]
fn test_get_str() {
    let v = serde_json::json!({"name": "hello", "count": 42});
    assert_eq!(get_str(&v, "name"), "hello");
    assert_eq!(get_str(&v, "missing"), "");
    assert_eq!(get_str(&v, "count"), "");
}

#[test]
fn test_get_obj() {
    let v = serde_json::json!({"spec": {"title": "test"}, "name": "foo"});
    assert!(get_obj(&v, "spec").is_some());
    assert!(get_obj(&v, "name").is_none());
    assert!(get_obj(&v, "missing").is_none());
}

#[test]
fn test_get_f64() {
    let v = serde_json::json!({"count": 3.14, "name": "foo"});
    assert_eq!(get_f64(&v, "count"), 3.14);
    assert_eq!(get_f64(&v, "missing"), 0.0);
    assert_eq!(get_f64(&v, "name"), 0.0);
}

#[test]
fn test_slugify_basic() {
    assert_eq!(slugify("hello-world"), "hello-world");
    assert_eq!(slugify("Hello World"), "hello-world");
    assert_eq!(slugify("My Post Title"), "my-post-title");
}

#[test]
fn test_slugify_special_chars() {
    assert_eq!(slugify("hello!@#world"), "hello-world");
    assert!(slugify("测试中文").starts_with("post-"));
    assert!(slugify("   ").starts_with("post-"));
}

#[test]
fn test_slugify_multiple_hyphens() {
    assert_eq!(slugify("hello---world"), "hello-world");
    assert_eq!(slugify("---hello---world---"), "hello-world");
}

#[test]
fn test_format_time_empty() {
    assert_eq!(format_time(""), "");
}

#[test]
fn test_format_time_valid() {
    let result = format_time("2026-04-16T10:23:00Z");
    assert!(result.contains("18:23"));
}

#[test]
fn test_format_time_invalid() {
    assert_eq!(format_time("not-a-date"), "not-a-date");
}

#[test]
fn test_build_post_link_with_slug() {
    let post = serde_json::json!({
        "spec": {"slug": "my-post"},
        "metadata": {"name": "fallback"}
    });
    assert_eq!(build_post_link("https://example.com", &post), "https://example.com/archives/my-post");
}

#[test]
fn test_build_post_link_fallback_name() {
    let post = serde_json::json!({
        "spec": {"slug": ""},
        "metadata": {"name": "post-123"}
    });
    assert_eq!(build_post_link("https://example.com", &post), "https://example.com/archives/post-123");
}

#[test]
fn test_build_post_link_base_trailing_slash() {
    let post = serde_json::json!({"spec": {"slug": "test"}});
    assert_eq!(build_post_link("https://example.com/", &post), "https://example.com/archives/test");
}
