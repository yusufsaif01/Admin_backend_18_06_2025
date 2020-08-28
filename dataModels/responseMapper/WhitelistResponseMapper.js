class WhiteListResponseMapper {
  static map(records) {
    return records.map((record) => ({
      id: record.id,
      name: record.name,
      email: record.email,
      phone: record.phone,
      created_at: record.createdAt,
    }));
  }
}

module.exports = WhiteListResponseMapper;
