package models

type User struct {
	Id           string `json:"id,omitempty" bson:"_id,omitempty"`
	Name         string `json:"name" bson:"name" validate:"required"`
	Password     string `json:"password,omitempty" bson:"password,omitempty"`
	MobileNumber string `json:"mobileNumber" bson:"mobileNumber" validate:"required"`
	Role         string `json:"role,omitempty" bson:"role,omitempty"`
}

type UpsertUser struct {
	Password     string `json:"password,omitempty" bson:"password,omitempty"`
	Name         string `json:"name" bson:"name"`
	MobileNumber string `json:"mobileNumber,omitempty" bson:"mobileNumber,omitempty"`
	Role         string `json:"role,omitempty" bson:"role,omitempty"`
}

func (u User) UpsertUser() UpsertUser {
	return UpsertUser{
		Password:     u.Password,
		Name:         u.Name,
		MobileNumber: u.MobileNumber,
		Role:         u.Role,
	}
}

type LoginRequest struct {
	MobileNumber string `json:"mobileNumber" validate:"required"`
	Password     string `json:"password" validate:"required"`
}

type LoginResponse struct {
	MobileNumber string `json:"mobileNumber"`
	Role         string `json:"role"`
	Id           string `json:"id"`
	Timestamp    string `json:"timestamp"`
	AccessToken  string `json:"accessToken"`
}

type RegisterResponse struct {
	MobileNumber string `json:"mobileNumber"`
	Password     string `json:"password"`
}

type GetUserResponse struct {
	Id           string `json:"id,omitempty"`
	Name         string `json:"name"`
	MobileNumber string `json:"mobileNumber"`
	Role         string `json:"role,omitempty"`
}
