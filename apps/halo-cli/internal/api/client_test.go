package api

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

// helper to create a test client pointing at the test server.
func newTestClient(ts *httptest.Server) *Client {
	return &Client{
		BaseURL: ts.URL,
		PAT:     "test-token-123",
		HTTP:    ts.Client(),
	}
}

func TestNewClient_TrimsTrailingSlash(t *testing.T) {
	c := NewClient("https://example.com/", "tok")
	if c.BaseURL != "https://example.com" {
		t.Fatalf("expected trimmed URL, got %s", c.BaseURL)
	}
}

func TestDo_GET_Success(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			t.Fatalf("expected GET, got %s", r.Method)
		}
		if r.URL.Path != "/apis/content.halo.run/v1alpha1/posts" {
			t.Fatalf("wrong path: %s", r.URL.Path)
		}
		auth := r.Header.Get("Authorization")
		if auth != "Bearer test-token-123" {
			t.Fatalf("wrong auth header: %s", auth)
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"items":[]}`))
	}))
	defer ts.Close()

	client := newTestClient(ts)
	resp, err := client.Do(http.MethodGet, "/apis/content.halo.run/v1alpha1/posts", nil)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}
	if !strings.Contains(string(resp.Body), "items") {
		t.Fatalf("expected items in body, got %s", resp.Body)
	}
}

func TestDo_POST_WithBody(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			t.Fatalf("expected POST, got %s", r.Method)
		}
		ct := r.Header.Get("Content-Type")
		if ct != "application/json" {
			t.Fatalf("expected application/json, got %s", ct)
		}

		var body map[string]string
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			t.Fatalf("failed to decode body: %v", err)
		}
		if body["title"] != "Hello World" {
			t.Fatalf("wrong body title: %s", body["title"])
		}

		w.WriteHeader(http.StatusCreated)
		w.Write([]byte(`{"name":"post-1"}`))
	}))
	defer ts.Close()

	client := newTestClient(ts)
	resp, err := client.Do(http.MethodPost, "/apis/api.console.halo.run/v1alpha1/posts",
		map[string]string{"title": "Hello World"})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("expected 201, got %d", resp.StatusCode)
	}
}

func TestDo_PUT_Success(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPut {
			t.Fatalf("expected PUT, got %s", r.Method)
		}
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"updated":true}`))
	}))
	defer ts.Close()

	client := newTestClient(ts)
	resp, err := client.Do(http.MethodPut, "/apis/api.console.halo.run/v1alpha1/posts/post-1",
		map[string]string{"title": "Updated"})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}
}

func TestDo_DELETE_Success(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodDelete {
			t.Fatalf("expected DELETE, got %s", r.Method)
		}
		w.WriteHeader(http.StatusNoContent)
	}))
	defer ts.Close()

	client := newTestClient(ts)
	resp, err := client.Do(http.MethodDelete, "/apis/content.halo.run/v1alpha1/posts/post-1", nil)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if resp.StatusCode != http.StatusNoContent {
		t.Fatalf("expected 204, got %d", resp.StatusCode)
	}
}

func TestDo_401_Unauthorized(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusUnauthorized)
		w.Write([]byte(`{"error":"invalid token"}`))
	}))
	defer ts.Close()

	client := newTestClient(ts)
	_, err := client.Do(http.MethodGet, "/apis/content.halo.run/v1alpha1/posts", nil)
	if err == nil {
		t.Fatal("expected error on 401")
	}
	if !strings.Contains(err.Error(), "认证失败") {
		t.Fatalf("expected 认证失败 in error, got: %s", err.Error())
	}
	if !strings.Contains(err.Error(), "401") {
		t.Fatalf("expected 401 in error, got: %s", err.Error())
	}
}

func TestDo_403_Forbidden(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusForbidden)
		w.Write([]byte(`{"error":"forbidden"}`))
	}))
	defer ts.Close()

	client := newTestClient(ts)
	_, err := client.Do(http.MethodGet, "/apis/content.halo.run/v1alpha1/posts", nil)
	if err == nil {
		t.Fatal("expected error on 403")
	}
	if !strings.Contains(err.Error(), "认证失败") {
		t.Fatalf("expected 认证失败 in error, got: %s", err.Error())
	}
	if !strings.Contains(err.Error(), "403") {
		t.Fatalf("expected 403 in error, got: %s", err.Error())
	}
}

func TestDo_404_NotFound(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte(`{"error":"not found"}`))
	}))
	defer ts.Close()

	client := newTestClient(ts)
	_, err := client.Do(http.MethodGet, "/apis/content.halo.run/v1alpha1/posts/nonexistent", nil)
	if err == nil {
		t.Fatal("expected error on 404")
	}
	if !strings.Contains(err.Error(), "资源不存在") {
		t.Fatalf("expected 资源不存在 in error, got: %s", err.Error())
	}
}

func TestDo_500_InternalError(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(`{"error":"internal server error"}`))
	}))
	defer ts.Close()

	client := newTestClient(ts)
	_, err := client.Do(http.MethodGet, "/apis/content.halo.run/v1alpha1/posts", nil)
	if err == nil {
		t.Fatal("expected error on 500")
	}
	if !strings.Contains(err.Error(), "请求失败") {
		t.Fatalf("expected 请求失败 in error, got: %s", err.Error())
	}
	if !strings.Contains(err.Error(), "500") {
		t.Fatalf("expected 500 in error, got: %s", err.Error())
	}
}

func TestDo_NetworkError(t *testing.T) {
	client := NewClient("http://127.0.0.1:1", "tok")
	_, err := client.Do(http.MethodGet, "/apis/content.halo.run/v1alpha1/posts", nil)
	if err == nil {
		t.Fatal("expected network error")
	}
	if !strings.Contains(err.Error(), "网络请求失败") {
		t.Fatalf("expected 网络请求失败 in error, got: %s", err.Error())
	}
}

func TestDo_ConsoleAPI_Path(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.HasPrefix(r.URL.Path, "/apis/api.console.halo.run/") {
			t.Fatalf("expected console API path, got: %s", r.URL.Path)
		}
		w.WriteHeader(http.StatusOK)
	}))
	defer ts.Close()

	client := newTestClient(ts)
	_, err := client.Do(http.MethodPost, "/apis/api.console.halo.run/v1alpha1/posts",
		map[string]string{"title": "Test"})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestDo_InvalidJSONBody(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))
	defer ts.Close()

	client := newTestClient(ts)

	// Use a type that json.Marshal will fail on.
	type BadType struct {
		Ch chan int
	}
	_, err := client.Do(http.MethodPost, "/apis/api.console.halo.run/v1alpha1/posts", BadType{})
	if err == nil {
		t.Fatal("expected error for unmarshalable body")
	}
	if !strings.Contains(err.Error(), "序列化请求体失败") {
		t.Fatalf("expected 序列化请求体失败, got: %s", err.Error())
	}
}
