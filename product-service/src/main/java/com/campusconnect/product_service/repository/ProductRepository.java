package com.campusconnect.product_service.repository;

import com.campusconnect.product_service.Product;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ProductRepository extends MongoRepository<Product, Integer> {
}