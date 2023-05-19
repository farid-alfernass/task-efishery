package token

type Claim struct {
	MobileNumber string `json:"mobileNumber"`
	UserId       string `json:"userId"`
	Role         string `json:"role"`
}
