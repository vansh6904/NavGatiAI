class UserModel {
  final String id;
  final String fullname;
  final String email;
  final String usertype;
  final bool verified;

  UserModel({
    required this.id,
    required this.fullname,
    required this.email,
    required this.usertype,
    required this.verified,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['_id'],
      fullname: json['fullname'] ?? '',
      email: json['email'] ?? '',
      usertype: json['usertype'] ?? '',
      verified: json['verified'] ?? false,
    );
  }
}
