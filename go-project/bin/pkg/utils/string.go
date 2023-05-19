package utils

import (
	"math/rand"

	"golang.org/x/crypto/bcrypt"
)

func GeneratePassword(chars string, length int) string {
	password := make([]byte, length)
	for i := 0; i < length; i++ {
		randomIndex := rand.Intn(len(chars))
		password[i] = chars[randomIndex]
	}
	return string(password)
}

func HashPassword(password string) string {
	bytes, _ := bcrypt.GenerateFromPassword([]byte(password), 10)

	return string(bytes)
}

func CheckPasswordHash(password, hash string) bool {

	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))

	return err == nil
}
