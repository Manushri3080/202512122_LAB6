package com.campusconnect.order_service.repository;

import com.campusconnect.order_service.Order;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface OrderRepository extends MongoRepository<Order, Integer> {
}