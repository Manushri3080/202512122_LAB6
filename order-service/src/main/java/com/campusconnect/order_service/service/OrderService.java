package com.campusconnect.order_service.service;

import com.campusconnect.order_service.Order;
import com.campusconnect.order_service.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final RestClient restClient;

    @Value("${USER_SERVICE_URL}")
    private String userServiceUrl;

    @Value("${PRODUCT_SERVICE_URL}")
    private String productServiceUrl;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
        this.restClient = RestClient.create();
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Optional<Order> getOrderById(int id) {
        return orderRepository.findById(id);
    }

    public Order createOrder(Order order) {

        // Verify User Service
        try {
            restClient.get()
                    .uri(userServiceUrl + "/users/" + order.getUserId())
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientException e) {
            throw new RuntimeException(
                    "User Service is unavailable or user does not exist."
            );
        }

        // Verify Product Service
        try {
            restClient.get()
                    .uri(productServiceUrl + "/products/" + order.getProductId())
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientException e) {
            throw new RuntimeException(
                    "Product Service is unavailable or product does not exist."
            );
        }

        return orderRepository.save(order);
    }
}