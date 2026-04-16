package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
)

// APIResponse wraps an HTTP response from the Halo API.
type APIResponse struct {
	StatusCode int
	Body       []byte
}

// Client communicates with the Halo CMS API.
// Supports both Console API and Extension API endpoints.
type Client struct {
	BaseURL string
	PAT     string
	HTTP    *http.Client
}

// NewClient creates a new Halo API client.
// baseURL: Halo 实例地址（如 https://halo.example.com）
// pat: Personal Access Token
func NewClient(baseURL, pat string) *Client {
	return &Client{
		BaseURL: strings.TrimRight(baseURL, "/"),
		PAT:     pat,
		HTTP:    &http.Client{},
	}
}

// Do sends an HTTP request to the Halo API.
//
// path should start with /apis/... (e.g., /apis/content.halo.run/v1alpha1/posts)
// body is JSON-serialized when non-nil.
func (c *Client) Do(method, path string, body interface{}) (*APIResponse, error) {
	url := c.BaseURL + path

	var reader io.Reader
	if body != nil {
		data, err := json.Marshal(body)
		if err != nil {
			return nil, fmt.Errorf("序列化请求体失败: %w", err)
		}
		reader = bytes.NewReader(data)
	}

	req, err := http.NewRequest(method, url, reader)
	if err != nil {
		return nil, fmt.Errorf("创建请求失败: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+c.PAT)
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, fmt.Errorf("网络请求失败，请检查网络连接或 Halo 实例地址: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("读取响应失败: %w", err)
	}

	// Handle HTTP error status codes.
	if resp.StatusCode >= 400 {
		msg := formatHTTPError(resp.StatusCode, respBody)
		return nil, fmt.Errorf("%s", msg)
	}

	return &APIResponse{
		StatusCode: resp.StatusCode,
		Body:       respBody,
	}, nil
}

// formatHTTPError returns a user-friendly error message based on status code.
func formatHTTPError(statusCode int, body []byte) string {
	bodyStr := string(body)

	switch statusCode {
	case 401, 403:
		return fmt.Sprintf("认证失败（HTTP %d）：请检查 HALO_PAT 是否正确，Token 是否过期。详情: %s", statusCode, bodyStr)
	case 404:
		return fmt.Sprintf("资源不存在（HTTP 404）：请检查 API 路径是否正确。详情: %s", bodyStr)
	default:
		return fmt.Sprintf("请求失败（HTTP %d）: %s", statusCode, bodyStr)
	}
}
