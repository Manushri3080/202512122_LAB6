package com.campusconnect.user_service.repository;

import com.campusconnect.user_service.User;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<User, Integer> {
}