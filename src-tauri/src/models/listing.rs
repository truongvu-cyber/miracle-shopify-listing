use serde::{Deserialize, Serialize};

/// Full product-level data for a Shopify listing
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ListingProduct {
    pub handle: String,
    #[serde(default)]
    pub title: String,
    #[serde(default)]
    pub body_html: String,
    #[serde(default)]
    pub vendor: String,
    #[serde(default)]
    pub tags: String,
    #[serde(default)]
    pub published: String,

    // Options
    #[serde(default)]
    pub option1_name: String,
    #[serde(default)]
    pub option2_name: String,
    #[serde(default)]
    pub option3_name: String,

    // Product flags
    #[serde(default)]
    pub gift_card: String,
    #[serde(default)]
    pub status: String,

    /// All variants for this product
    #[serde(default)]
    pub variants: Vec<VariantData>,
}

/// Variant-level data
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct VariantData {
    #[serde(default)]
    pub option1_value: String,
    #[serde(default)]
    pub option2_value: String,
    #[serde(default)]
    pub option3_value: String,
    #[serde(default)]
    pub sku: String,
    #[serde(default)]
    pub grams: String,
    #[serde(default)]
    pub inventory_policy: String,
    #[serde(default)]
    pub fulfillment_service: String,
    #[serde(default)]
    pub price: String,
    #[serde(default)]
    pub compare_at_price: String,
    #[serde(default)]
    pub requires_shipping: String,
    #[serde(default)]
    pub taxable: String,
    #[serde(default)]
    pub image_src: String,
    #[serde(default)]
    pub variant_image: String,
    #[serde(default)]
    pub weight_unit: String,
    #[serde(default)]
    pub cost_per_item: String,
}

/// Result of matching an image to a variant
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MatchResult {
    pub image_url: String,
    #[serde(default)]
    pub variant_index: Option<usize>,
    pub match_type: String, // "exact", "fuzzy", "unmatched"
    #[serde(default)]
    pub confidence: f64,
    #[serde(default)]
    pub is_variant_image: bool,
}

/// An image-only row for extra product images
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ImageRow {
    pub image_src: String,
    pub image_position: u32,
    #[serde(default)]
    pub image_alt_text: String,
}

/// Request payload for CSV generation
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CSVGenerateRequest {
    pub product: ListingProduct,
    #[serde(default)]
    pub match_results: Vec<MatchResult>,
    #[serde(default)]
    pub extra_images: Vec<ImageRow>,
    pub output_path: String,
}

/// Settings saved to app data
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    #[serde(default)]
    pub google_api_key: String,
    #[serde(default)]
    pub csv_save_directory: String,
}

/// A saved listing in history
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ListingHistory {
    pub id: String,
    pub title: String,
    pub handle: String,
    pub created_at: String,
    #[serde(default)]
    pub variant_count: u32,
    #[serde(default)]
    pub image_count: u32,
    pub product: ListingProduct,
    #[serde(default)]
    pub match_results: Vec<MatchResult>,
}
