use crate::models::{CSVGenerateRequest, ListingProduct, MatchResult, VariantData};
use std::io::Write;

/// The exact 28 Shopify CSV column headers in order.
pub const SHOPIFY_HEADERS: &[&str] = &[
    "Handle",                    // 0
    "Title",                     // 1
    "Body (HTML)",               // 2
    "Vendor",                    // 3
    "Tags",                      // 4
    "Published",                 // 5
    "Option1 Name",              // 6
    "Option1 Value",             // 7
    "Option2 Name",              // 8
    "Option2 Value",             // 9
    "Option3 Name",              // 10
    "Option3 Value",             // 11
    "Variant SKU",               // 12
    "Variant Grams",             // 13
    "Variant Inventory Policy",  // 14
    "Variant Fulfillment Service", // 15
    "Variant Price",             // 16
    "Variant Compare At Price",  // 17
    "Variant Requires Shipping", // 18
    "Variant Taxable",           // 19
    "Image Src",                 // 20
    "Image Position",            // 21
    "Image Alt Text",            // 22
    "Gift Card",                 // 23
    "Variant Image",             // 24
    "Variant Weight Unit",       // 25
    "Cost per item",             // 26
    "Status",                    // 27
];

/// Build a complete row (28 columns) as a Vec<String>.
fn empty_row() -> Vec<String> {
    vec![String::new(); SHOPIFY_HEADERS.len()]
}

/// Fill product-level columns into a row.
fn fill_product_columns(row: &mut [String], product: &ListingProduct) {
    row[0] = product.handle.clone();
    row[1] = product.title.clone();
    row[2] = product.body_html.clone();
    row[3] = product.vendor.clone();
    row[4] = product.tags.clone();
    row[5] = product.published.clone();
    row[6] = product.option1_name.clone();
    row[8] = product.option2_name.clone();
    row[10] = product.option3_name.clone();
    row[23] = product.gift_card.clone();
    row[27] = product.status.clone();
}

/// Fill variant-level columns into a row.
fn fill_variant_columns(row: &mut [String], variant: &VariantData) {
    row[7] = variant.option1_value.clone();
    row[9] = variant.option2_value.clone();
    row[11] = variant.option3_value.clone();
    row[12] = variant.sku.clone();
    row[13] = variant.grams.clone();
    row[14] = variant.inventory_policy.clone();
    row[15] = variant.fulfillment_service.clone();
    row[16] = variant.price.clone();
    row[17] = variant.compare_at_price.clone();
    row[18] = variant.requires_shipping.clone();
    row[19] = variant.taxable.clone();
    row[24] = variant.variant_image.clone();
    row[25] = variant.weight_unit.clone();
    row[26] = variant.cost_per_item.clone();
}

/// Find the image URL matched to a specific variant index.
fn find_variant_image(matches: &[MatchResult], variant_idx: usize) -> Option<&MatchResult> {
    matches.iter().find(|m| {
        m.is_variant_image && m.variant_index == Some(variant_idx)
    })
}

/// Collect images not assigned as variant images (used as extra product images).
fn collect_extra_images(matches: &[MatchResult]) -> Vec<&MatchResult> {
    matches.iter().filter(|m| !m.is_variant_image).collect()
}

/// Generate the complete Shopify CSV and write it to the given path.
/// Returns the output path on success.
pub fn generate_csv(request: &CSVGenerateRequest) -> Result<String, String> {
    let product = &request.product;
    let matches = &request.match_results;
    let extra_images = &request.extra_images;
    let output_path = &request.output_path;

    let mut all_rows: Vec<Vec<String>> = Vec::new();
    let mut image_position: u32 = 1;

    let variants = &product.variants;

    if variants.is_empty() {
        // Single product row with no variants
        let mut row = empty_row();
        fill_product_columns(&mut row, product);

        // If there are matched images, put the first one on this row
        let extra = collect_extra_images(matches);
        if let Some(first) = extra.first() {
            row[20] = first.image_url.clone();
            row[21] = image_position.to_string();
            row[22] = product.title.clone();
            image_position += 1;
        }

        all_rows.push(row);

        // Remaining extra matched images as image-only rows
        for img in extra.iter().skip(1) {
            let mut row = empty_row();
            row[0] = product.handle.clone();
            row[20] = img.image_url.clone();
            row[21] = image_position.to_string();
            row[22] = product.title.clone();
            image_position += 1;
            all_rows.push(row);
        }
    } else {
        // Row 1: product row + first variant
        let first_variant = &variants[0];
        let mut row = empty_row();
        fill_product_columns(&mut row, product);
        fill_variant_columns(&mut row, first_variant);

        // Check for variant image match
        if let Some(m) = find_variant_image(matches, 0) {
            row[20] = m.image_url.clone();
            row[21] = image_position.to_string();
            row[22] = product.title.clone();
            row[24] = m.image_url.clone();
            image_position += 1;
        }

        all_rows.push(row);

        // Row 2+: additional variant rows
        for (idx, variant) in variants.iter().enumerate().skip(1) {
            let mut row = empty_row();
            row[0] = product.handle.clone();
            fill_variant_columns(&mut row, variant);

            if let Some(m) = find_variant_image(matches, idx) {
                row[20] = m.image_url.clone();
                row[21] = image_position.to_string();
                row[24] = m.image_url.clone();
                image_position += 1;
            }

            all_rows.push(row);
        }

        // Extra product images (not variant-specific) as image-only rows
        let extra_matched = collect_extra_images(matches);
        for img in &extra_matched {
            let mut row = empty_row();
            row[0] = product.handle.clone();
            row[20] = img.image_url.clone();
            row[21] = image_position.to_string();
            row[22] = product.title.clone();
            image_position += 1;
            all_rows.push(row);
        }
    }

    // Append any explicit extra_images from the request
    for img in extra_images {
        let mut row = empty_row();
        row[0] = product.handle.clone();
        row[20] = img.image_src.clone();
        row[21] = image_position.to_string();
        row[22] = if img.image_alt_text.is_empty() {
            product.title.clone()
        } else {
            img.image_alt_text.clone()
        };
        image_position += 1;
        all_rows.push(row);
    }

    // Write CSV
    let file = std::fs::File::create(output_path)
        .map_err(|e| format!("Failed to create CSV file: {}", e))?;
    let mut writer = std::io::BufWriter::new(file);

    // Write BOM for Excel compatibility
    writer
        .write_all(b"\xef\xbb\xbf")
        .map_err(|e| format!("Failed to write BOM: {}", e))?;

    let mut csv_writer = csv::Writer::from_writer(writer);

    // Header row
    csv_writer
        .write_record(SHOPIFY_HEADERS)
        .map_err(|e| format!("Failed to write CSV header: {}", e))?;

    // Data rows
    for row in &all_rows {
        csv_writer
            .write_record(row)
            .map_err(|e| format!("Failed to write CSV row: {}", e))?;
    }

    csv_writer
        .flush()
        .map_err(|e| format!("Failed to flush CSV: {}", e))?;

    Ok(output_path.clone())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_headers_count() {
        assert_eq!(SHOPIFY_HEADERS.len(), 28);
    }

    #[test]
    fn test_empty_row_count() {
        assert_eq!(empty_row().len(), 28);
    }
}
