package com.uniteddistributors.backend.repository;

import com.uniteddistributors.backend.model.CustomerOrder;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository
        extends JpaRepository<CustomerOrder, Long> {

    @EntityGraph(attributePaths = {
            "customer",
            "items"
    })
    List<CustomerOrder>
    findByCustomerIdOrderByCreatedAtDesc(
            Long customerId
    );

    @EntityGraph(attributePaths = {
            "customer",
            "items"
    })
    List<CustomerOrder>
    findAllByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {
            "customer",
            "items"
    })
    Optional<CustomerOrder> findByOrderCode(
            String orderCode
    );
}