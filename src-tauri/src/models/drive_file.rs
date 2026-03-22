use serde::{Deserialize, Serialize};

/// Represents a single file from Google Drive API
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DriveFile {
    pub id: String,
    pub name: String,
    pub mime_type: String,
    #[serde(default)]
    pub web_content_link: Option<String>,
    #[serde(default)]
    pub thumbnail_link: Option<String>,
}

/// Response shape from Google Drive API v3 files.list
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DriveApiResponse {
    #[serde(default)]
    pub files: Vec<DriveApiFile>,
    #[serde(default)]
    pub next_page_token: Option<String>,
}

/// Internal representation from API before mapping to DriveFile
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DriveApiFile {
    pub id: String,
    pub name: String,
    pub mime_type: String,
    #[serde(default)]
    pub web_content_link: Option<String>,
    #[serde(default)]
    pub thumbnail_link: Option<String>,
}

impl From<DriveApiFile> for DriveFile {
    fn from(f: DriveApiFile) -> Self {
        Self {
            id: f.id,
            name: f.name,
            mime_type: f.mime_type,
            web_content_link: f.web_content_link,
            thumbnail_link: f.thumbnail_link,
        }
    }
}
