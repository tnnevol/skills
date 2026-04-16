package actions

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"halo-cli/internal/api"
)

// Test fixtures
var mockPostResponse = map[string]interface{}{
	"apiVersion": "content.halo.run/v1alpha1",
	"kind":       "Post",
	"metadata": map[string]interface{}{
		"name":                "test-post",
		"version":             float64(1),
		"creationTimestamp":   "2024-01-01T00:00:00Z",
	},
	"spec": map[string]interface{}{
		"title":        "Test Post",
		"slug":         "test-post",
		"publish":      true,
		"visible":      "PUBLIC",
		"allowComment": true,
		"pinned":       false,
		"categories":   []string{},
		"tags":         []string{},
	},
	"status": map[string]interface{}{
		"visitCount": float64(42),
	},
}

var mockListResponse = map[string]interface{}{
	"items": []interface{}{
		mockPostResponse,
		map[string]interface{}{
			"apiVersion": "content.halo.run/v1alpha1",
			"kind":       "Post",
			"metadata": map[string]interface{}{
				"name":                "draft-post",
				"version":             float64(1),
				"creationTimestamp":   "2024-01-02T00:00:00Z",
			},
			"spec": map[string]interface{}{
				"title":   "Draft Post",
				"slug":    "draft-post",
				"publish": false,
				"visible": "PRIVATE",
			},
			"status": map[string]interface{}{
				"visitCount": float64(0),
			},
		},
	},
	"total":   float64(2),
	"hasNext": false,
}

func newTestClient(handler http.HandlerFunc) *api.Client {
	ts := httptest.NewServer(handler)
	return &api.Client{
		BaseURL: ts.URL,
		PAT:     "test-token",
		HTTP:    ts.Client(),
	}
}

func newJSONHandler(statusCode int, body map[string]interface{}) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(statusCode)
		json.NewEncoder(w).Encode(body)
	}
}

// ==================== ParseFlags Tests ====================

func TestParseFlags_Basic(t *testing.T) {
	flags, positional := ParseFlags([]string{"--title=Hello", "--slug=hello", "arg1"})
	if flags["title"] != "Hello" {
		t.Fatalf("title: want Hello, got %s", flags["title"])
	}
	if flags["slug"] != "hello" {
		t.Fatalf("slug: want hello, got %s", flags["slug"])
	}
	if len(positional) != 1 || positional[0] != "arg1" {
		t.Fatalf("positional: want [arg1], got %v", positional)
	}
}

func TestParseFlags_BooleanFlag(t *testing.T) {
	flags, _ := ParseFlags([]string{"--publish", "--public"})
	if flags["publish"] != "true" {
		t.Fatalf("publish: want true, got %s", flags["publish"])
	}
	if flags["public"] != "true" {
		t.Fatalf("public: want true, got %s", flags["public"])
	}
}

func TestParseFlags_KeywordWithEquals(t *testing.T) {
	flags, _ := ParseFlags([]string{"--keyword=hello world"})
	if flags["keyword"] != "hello world" {
		t.Fatalf("keyword: want 'hello world', got %s", flags["keyword"])
	}
}

// ==================== Slugify Tests ====================

func TestSlugify_Basic(t *testing.T) {
	s := Slugify("Hello World")
	if s != "hello-world" {
		t.Fatalf("want hello-world, got %s", s)
	}
}

func TestSlugify_SpecialChars(t *testing.T) {
	s := Slugify("My Post! With @special# chars")
	if !strings.Contains(s, "my-post") {
		t.Fatalf("expected 'my-post' in slug, got %s", s)
	}
}

func TestSlugify_Chinese(t *testing.T) {
	// Chinese characters should produce a timestamp-based slug
	s := Slugify("测试文章")
	if s == "" {
		t.Fatal("slug should not be empty for Chinese text")
	}
	// Should contain "post-" prefix as fallback
	if !strings.HasPrefix(s, "post-") {
		t.Fatalf("expected post- prefix for Chinese, got %s", s)
	}
}

func TestSlugify_Cleanup(t *testing.T) {
	s := Slugify("  hello---world  ")
	if s != "hello-world" {
		t.Fatalf("want hello-world, got %s", s)
	}
}

// ==================== FormatTime Tests ====================

func TestFormatTime_Valid(t *testing.T) {
	result := FormatTime("2024-01-15T10:30:00Z")
	if result == "" {
		t.Fatal("expected formatted time, got empty")
	}
	if !strings.Contains(result, "2024") {
		t.Fatalf("expected year 2024 in output, got %s", result)
	}
}

func TestFormatTime_Empty(t *testing.T) {
	result := FormatTime("")
	if result != "" {
		t.Fatalf("expected empty for empty input, got %s", result)
	}
}

func TestFormatTime_Invalid(t *testing.T) {
	result := FormatTime("not-a-date")
	if result != "not-a-date" {
		t.Fatalf("expected passthrough for invalid date, got %s", result)
	}
}

// ==================== BuildPostLink Tests ====================

func TestBuildPostLink_WithSlug(t *testing.T) {
	post := map[string]interface{}{
		"spec": map[string]interface{}{
			"slug": "my-post",
		},
	}
	link := BuildPostLink("https://example.com", post)
	expected := "https://example.com/archives/my-post"
	if link != expected {
		t.Fatalf("want %s, got %s", expected, link)
	}
}

func TestBuildPostLink_FallbackToName(t *testing.T) {
	post := map[string]interface{}{
		"spec": map[string]interface{}{},
		"metadata": map[string]interface{}{
			"name": "fallback-name",
		},
	}
	link := BuildPostLink("https://example.com", post)
	expected := "https://example.com/archives/fallback-name"
	if link != expected {
		t.Fatalf("want %s, got %s", expected, link)
	}
}

func TestBuildPostLink_NoSlug(t *testing.T) {
	post := map[string]interface{}{
		"spec": map[string]interface{}{},
	}
	link := BuildPostLink("https://example.com", post)
	// Should use baseURL as fallback when no slug or name
	if link != "https://example.com" {
		t.Fatalf("want baseURL, got %s", link)
	}
}

func TestBuildPostLink_TrailingSlash(t *testing.T) {
	post := map[string]interface{}{
		"spec": map[string]interface{}{
			"slug": "test",
		},
	}
	link := BuildPostLink("https://example.com/", post)
	expected := "https://example.com/archives/test"
	if link != expected {
		t.Fatalf("want %s, got %s", expected, link)
	}
}

// ==================== Truncate Tests ====================

func TestTruncate_Short(t *testing.T) {
	result := Truncate("hello", 10)
	if result != "hello" {
		t.Fatalf("want hello, got %s", result)
	}
}

func TestTruncate_Long(t *testing.T) {
	result := Truncate("hello world this is a long string", 10)
	if !strings.HasSuffix(result, "...") {
		t.Fatalf("expected ... suffix, got %s", result)
	}
}

// ==================== ActionList Tests ====================

func TestActionList_Success(t *testing.T) {
	client := newTestClient(newJSONHandler(200, mockListResponse))
	err := ActionList(client, []string{"--limit=10", "--page=1"})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestActionList_Empty(t *testing.T) {
	emptyResp := map[string]interface{}{
		"items": []interface{}{},
		"total": float64(0),
	}
	client := newTestClient(newJSONHandler(200, emptyResp))
	err := ActionList(client, nil)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestActionList_WithKeyword(t *testing.T) {
	var receivedURL string
	handler := func(w http.ResponseWriter, r *http.Request) {
		receivedURL = r.URL.RawQuery
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(200)
		json.NewEncoder(w).Encode(mockListResponse)
	}
	client := newTestClient(handler)
	err := ActionList(client, []string{"--keyword=test"})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !strings.Contains(receivedURL, "keyword=test") {
		t.Fatalf("expected keyword in URL, got %s", receivedURL)
	}
}

// ==================== ActionGet Tests ====================

func TestActionGet_Success(t *testing.T) {
	var receivedPaths []string
	handler := func(w http.ResponseWriter, r *http.Request) {
		receivedPaths = append(receivedPaths, r.URL.Path)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(200)
		json.NewEncoder(w).Encode(mockPostResponse)
	}
	client := newTestClient(handler)
	err := ActionGet(client, []string{"test-post"})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	found := false
	for _, p := range receivedPaths {
		if strings.HasSuffix(p, "/test-post") {
			found = true
			break
		}
	}
	if !found {
		t.Fatalf("expected /test-post in paths, got %v", receivedPaths)
	}
}

func TestActionGet_MissingName(t *testing.T) {
	client := newTestClient(newJSONHandler(200, mockPostResponse))
	err := ActionGet(client, []string{})
	if err == nil {
		t.Fatal("expected error for missing name")
	}
	if !strings.Contains(err.Error(), "用法") {
		t.Fatalf("expected usage hint, got: %v", err)
	}
}

func TestActionGet_WithError(t *testing.T) {
	client := newTestClient(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(404)
		w.Write([]byte(`{"error":"not found"}`))
	})
	err := ActionGet(client, []string{"nonexistent"})
	if err == nil {
		t.Fatal("expected error for 404")
	}
}

// ==================== ActionCreate Tests ====================

func TestActionCreate_MissingTitle(t *testing.T) {
	client := newTestClient(newJSONHandler(200, mockPostResponse))
	err := ActionCreate(client, []string{})
	if err == nil {
		t.Fatal("expected error for missing title")
	}
	if !strings.Contains(err.Error(), "用法") {
		t.Fatalf("expected usage hint, got: %v", err)
	}
}

func TestActionCreate_Success(t *testing.T) {
	var receivedBody map[string]interface{}
	handler := func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "POST" {
			t.Fatalf("expected POST, got %s", r.Method)
		}
		json.NewDecoder(r.Body).Decode(&receivedBody)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(201)
		json.NewEncoder(w).Encode(mockPostResponse)
	}
	client := newTestClient(handler)
	err := ActionCreate(client, []string{"--title=Test Article", "--raw=# Hello", "--public"})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	// Verify nested format
	postReq, ok := receivedBody["post"].(map[string]interface{})
	if !ok {
		t.Fatal("expected 'post' key in request body")
	}
	spec := postReq["spec"].(map[string]interface{})
	if spec["visible"] != "PUBLIC" {
		t.Fatalf("expected PUBLIC visibility, got %v", spec["visible"])
	}
	content, ok := receivedBody["content"].(map[string]interface{})
	if !ok {
		t.Fatal("expected 'content' key in request body")
	}
	if content["rawType"] != "HTML" {
		t.Fatalf("expected HTML rawType, got %v", content["rawType"])
	}
}

func TestActionCreate_WithContent(t *testing.T) {
	var receivedBody map[string]interface{}
	handler := func(w http.ResponseWriter, r *http.Request) {
		json.NewDecoder(r.Body).Decode(&receivedBody)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(201)
		json.NewEncoder(w).Encode(mockPostResponse)
	}
	client := newTestClient(handler)
	err := ActionCreate(client, []string{"--title=Test", "--content=<p>HTML</p>"})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	content := receivedBody["content"].(map[string]interface{})
	if content["raw"] != "<p>HTML</p>" {
		t.Fatalf("expected raw=HTML content, got %v", content["raw"])
	}
}

func TestActionCreate_MdToHtml(t *testing.T) {
	var receivedBody map[string]interface{}
	handler := func(w http.ResponseWriter, r *http.Request) {
		json.NewDecoder(r.Body).Decode(&receivedBody)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(201)
		json.NewEncoder(w).Encode(mockPostResponse)
	}
	client := newTestClient(handler)
	err := ActionCreate(client, []string{"--title=Test", "--raw=**bold**"})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	content := receivedBody["content"].(map[string]interface{})
	raw := content["raw"].(string)
	if !strings.Contains(raw, "<strong>") {
		t.Fatalf("expected Markdown→HTML conversion, got: %s", raw)
	}
}

// ==================== ActionUpdate Tests ====================

func TestUpdateAction_MissingName(t *testing.T) {
	client := newTestClient(newJSONHandler(200, mockPostResponse))
	err := ActionUpdate(client, []string{"--title=New"})
	if err == nil {
		t.Fatal("expected error for missing name")
	}
}

func TestActionUpdate_Success(t *testing.T) {
	callCount := 0
	handler := func(w http.ResponseWriter, r *http.Request) {
		callCount++
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(200)
		json.NewEncoder(w).Encode(mockPostResponse)
	}
	client := newTestClient(handler)
	err := ActionUpdate(client, []string{"test-post", "--title=Updated Title"})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	// Should be 1 call (GET latest + PUT update = 2 calls)
	if callCount < 1 {
		t.Fatal("expected at least 1 API call")
	}
}

func TestActionUpdate_WithContent(t *testing.T) {
	var calls []string
	handler := func(w http.ResponseWriter, r *http.Request) {
		calls = append(calls, r.Method+" "+r.URL.Path)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(200)
		json.NewEncoder(w).Encode(mockPostResponse)
	}
	client := newTestClient(handler)
	err := ActionUpdate(client, []string{"test-post", "--raw=# New Content"})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	// Should have: GET post, PUT content, PUT metadata
	if len(calls) < 3 {
		t.Fatalf("expected 3 API calls, got %d: %v", len(calls), calls)
	}
}

// ==================== ActionDelete Tests ====================

func TestActionDelete_MissingName(t *testing.T) {
	client := newTestClient(newJSONHandler(200, mockPostResponse))
	err := ActionDelete(client, []string{})
	if err == nil {
		t.Fatal("expected error for missing name")
	}
}

func TestActionDelete_Success(t *testing.T) {
	var calls []string
	handler := func(w http.ResponseWriter, r *http.Request) {
		calls = append(calls, r.Method+" "+r.URL.Path)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(200)
		json.NewEncoder(w).Encode(mockPostResponse)
	}
	client := newTestClient(handler)
	err := ActionDelete(client, []string{"test-post"})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(calls) != 2 {
		t.Fatalf("expected 2 calls (GET info + DELETE), got %d: %v", len(calls), calls)
	}
	if calls[1] != "DELETE /apis/content.halo.run/v1alpha1/posts/test-post" {
		t.Fatalf("expected DELETE call, got %s", calls[1])
	}
}

// ==================== ActionPublish Tests ====================

func TestActionPublish_MissingName(t *testing.T) {
	client := newTestClient(newJSONHandler(200, mockPostResponse))
	err := ActionPublish(client, []string{})
	if err == nil {
		t.Fatal("expected error for missing name")
	}
}

func TestActionPublish_Success(t *testing.T) {
	var receivedPath string
	handler := func(w http.ResponseWriter, r *http.Request) {
		receivedPath = r.URL.Path
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(200)
		json.NewEncoder(w).Encode(mockPostResponse)
	}
	client := newTestClient(handler)
	err := ActionPublish(client, []string{"test-post"})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !strings.HasSuffix(receivedPath, "/test-post/publish") {
		t.Fatalf("expected /publish endpoint, got %s", receivedPath)
	}
}

// ==================== ActionUnpublish Tests ====================

func TestActionUnpublish_Success(t *testing.T) {
	var receivedPath string
	handler := func(w http.ResponseWriter, r *http.Request) {
		receivedPath = r.URL.Path
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(200)
		json.NewEncoder(w).Encode(mockPostResponse)
	}
	client := newTestClient(handler)
	err := ActionUnpublish(client, []string{"test-post"})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !strings.HasSuffix(receivedPath, "/test-post/unpublish") {
		t.Fatalf("expected /unpublish endpoint, got %s", receivedPath)
	}
}

// ==================== Utils Tests ====================

func TestCleanSpec(t *testing.T) {
	spec := map[string]interface{}{
		"title":   "Test",
		"slug":    "",
		"cover":   "",
		"visible": "PUBLIC",
	}
	CleanSpec(spec)
	if _, ok := spec["slug"]; ok {
		t.Fatal("slug should be removed when empty")
	}
	if _, ok := spec["cover"]; ok {
		t.Fatal("cover should be removed when empty")
	}
	if spec["title"] != "Test" {
		t.Fatalf("title should be preserved, got %v", spec["title"])
	}
}

func TestGetString(t *testing.T) {
	data := map[string]interface{}{"name": "test"}
	if GetString(data, "name") != "test" {
		t.Fatal("expected 'test'")
	}
	if GetString(data, "missing") != "" {
		t.Fatal("expected empty for missing key")
	}
}

func TestGetMap(t *testing.T) {
	data := map[string]interface{}{
		"spec": map[string]interface{}{"title": "Test"},
	}
	spec := GetMap(data, "spec")
	if spec == nil || spec["title"] != "Test" {
		t.Fatal("expected spec map")
	}
	if GetMap(data, "missing") != nil {
		t.Fatal("expected nil for missing key")
	}
}
