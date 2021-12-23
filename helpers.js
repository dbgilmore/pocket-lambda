function generateTag(key, tag_value) {
  return {"action": "tags_add", "item_id": key, "tags": tag_value}
}

function generateDate() {
    let date_ob = new Date();
    let day = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear()
    return `${year}-${month}-${day}`
}

module.exports = { generateTag, generateDate };
