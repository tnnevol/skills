package env

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// saveAndClearEnv saves env vars and clears them for test isolation.
func saveAndClearEnv(vars []string) map[string]string {
	saved := make(map[string]string)
	for _, v := range vars {
		saved[v] = os.Getenv(v)
		os.Setenv(v, "")
	}
	return saved
}

// restoreEnv restores saved env vars.
func restoreEnv(saved map[string]string) {
	for k, v := range saved {
		if v != "" {
			os.Setenv(k, v)
		} else {
			os.Unsetenv(k)
		}
	}
}

func TestParseEnvFileData_Basic(t *testing.T) {
	// Clear env vars to ensure isolation.
	saved := saveAndClearEnv([]string{"HALO_BASE_URL", "HALO_PAT"})
	defer restoreEnv(saved)

	data := []byte(`
HALO_BASE_URL=https://example.com
HALO_PAT=my-secret-token
`)
	err := parseEnvFileData(data)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got := os.Getenv("HALO_BASE_URL"); got != "https://example.com" {
		t.Fatalf("HALO_BASE_URL: want https://example.com, got %s", got)
	}
	if got := os.Getenv("HALO_PAT"); got != "my-secret-token" {
		t.Fatalf("HALO_PAT: want my-secret-token, got %s", got)
	}
}

func TestParseEnvFileData_QuotedValues(t *testing.T) {
	saved := saveAndClearEnv([]string{"HALO_BASE_URL", "HALO_PAT"})
	defer restoreEnv(saved)

	data := []byte(`HALO_BASE_URL="https://quoted.com"
HALO_PAT='single-quoted'
`)
	_ = parseEnvFileData(data)

	if got := os.Getenv("HALO_BASE_URL"); got != "https://quoted.com" {
		t.Fatalf("want https://quoted.com, got %s", got)
	}
	if got := os.Getenv("HALO_PAT"); got != "single-quoted" {
		t.Fatalf("want single-quoted, got %s", got)
	}
}

func TestParseEnvFileData_IgnoresCommentsAndBlanks(t *testing.T) {
	saved := saveAndClearEnv([]string{"FOO"})
	defer restoreEnv(saved)

	data := []byte(`
# This is a comment

FOO=bar
# Another comment
`)
	_ = parseEnvFileData(data)
	if got := os.Getenv("FOO"); got != "bar" {
		t.Fatalf("want bar, got %s", got)
	}
}

func TestParseEnvFileData_OnlySetIfEmpty(t *testing.T) {
	saved := saveAndClearEnv([]string{"EXISTING"})
	defer restoreEnv(saved)

	os.Setenv("EXISTING", "already-set")
	data := []byte("EXISTING=overwritten")
	_ = parseEnvFileData(data)
	if got := os.Getenv("EXISTING"); got != "already-set" {
		t.Fatalf("expected existing value to be preserved, got %s", got)
	}
}

func TestParseEnvFileData_NoEquals(t *testing.T) {
	data := []byte("INVALID_LINE_NO_EQUALS")
	err := parseEnvFileData(data)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestFindProjectRoot(t *testing.T) {
	tmp := t.TempDir()
	gitPath := filepath.Join(tmp, ".git")
	_ = os.WriteFile(gitPath, []byte{}, 0644)

	subDir := filepath.Join(tmp, "a", "b", "c")
	_ = os.MkdirAll(subDir, 0755)

	root := findProjectRoot(subDir)
	if root != tmp {
		t.Fatalf("want %s, got %s", tmp, root)
	}
}

func TestFindProjectRoot_WithPackageJSON(t *testing.T) {
	tmp := t.TempDir()
	pkgPath := filepath.Join(tmp, "package.json")
	_ = os.WriteFile(pkgPath, []byte("{}"), 0644)

	subDir := filepath.Join(tmp, "src", "deep")
	_ = os.MkdirAll(subDir, 0755)

	root := findProjectRoot(subDir)
	if root != tmp {
		t.Fatalf("want %s, got %s", tmp, root)
	}
}

func TestLoadEnv_MissingConfig(t *testing.T) {
	saved := saveAndClearEnv([]string{"HALO_BASE_URL", "HALO_PAT"})
	defer restoreEnv(saved)

	cfg, err := LoadEnv()
	if err == nil {
		t.Fatal("expected error when config is missing")
	}
	if cfg != nil {
		t.Fatal("expected nil config on error")
	}
	if !strings.Contains(err.Error(), "HALO_BASE_URL") {
		t.Fatalf("error should mention HALO_BASE_URL: %v", err)
	}
}

func TestLoadEnv_FromEnvVars(t *testing.T) {
	saved := saveAndClearEnv([]string{"HALO_BASE_URL", "HALO_PAT"})
	defer restoreEnv(saved)

	os.Setenv("HALO_BASE_URL", "https://halo.example.com/")
	os.Setenv("HALO_PAT", "test-pat-123")

	cfg, err := LoadEnv()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if cfg.BaseURL != "https://halo.example.com" {
		t.Fatalf("trailing slash not trimmed: got %s", cfg.BaseURL)
	}
	if cfg.PAT != "test-pat-123" {
		t.Fatalf("PAT mismatch: got %s", cfg.PAT)
	}
}

func TestLoadEnv_TrailingSlashTrimmed(t *testing.T) {
	saved := saveAndClearEnv([]string{"HALO_BASE_URL", "HALO_PAT"})
	defer restoreEnv(saved)

	os.Setenv("HALO_BASE_URL", "https://halo.example.com///")
	os.Setenv("HALO_PAT", "token")

	cfg, err := LoadEnv()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if cfg.BaseURL != "https://halo.example.com" {
		t.Fatalf("trailing slashes not trimmed: got %s", cfg.BaseURL)
	}
}

func TestLoadEnv_Priority_EnvOverridesEnvFile(t *testing.T) {
	saved := saveAndClearEnv([]string{"HALO_BASE_URL", "HALO_PAT"})
	defer restoreEnv(saved)

	// Create a temp .env file.
	tmp := t.TempDir()
	envPath := filepath.Join(tmp, ".env")
	_ = os.WriteFile(envPath, []byte(`
HALO_BASE_URL=https://from-env-file.com
HALO_PAT=pat-from-file
`), 0644)

	// Set env var with higher priority.
	os.Setenv("HALO_BASE_URL", "https://from-os-env.com")
	os.Setenv("HALO_PAT", "pat-from-os")

	// Chdir to tmp so findProjectRoot finds it.
	oldWd, _ := os.Getwd()
	_ = os.Chdir(tmp)
	defer func() { _ = os.Chdir(oldWd) }()

	cfg, err := LoadEnv()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	// OS env should override .env file.
	if cfg.BaseURL != "https://from-os-env.com" {
		t.Fatalf("env var should override .env file: got %s", cfg.BaseURL)
	}
	if cfg.PAT != "pat-from-os" {
		t.Fatalf("env var should override .env file: got %s", cfg.PAT)
	}
}
