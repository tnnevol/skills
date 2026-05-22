use halo_cli::markdown::md_to_html;

#[test]
fn test_md_to_html_paragraph() {
    let html = md_to_html("hello world");
    assert!(html.contains("<p>hello world</p>"));
}

#[test]
fn test_md_to_html_heading() {
    let html = md_to_html("# Title");
    assert!(html.contains("<h1>Title</h1>"));
}

#[test]
fn test_md_to_html_empty() {
    assert_eq!(md_to_html(""), "");
}

#[test]
fn test_md_to_html_code_block() {
    let html = md_to_html("```\ncode\n```");
    assert!(html.contains("<code>"));
}
