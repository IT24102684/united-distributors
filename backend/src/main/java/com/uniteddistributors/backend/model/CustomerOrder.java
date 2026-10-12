package com.uniteddistributors.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "customer_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerOrder {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;

    @Column(
            nullable = false,
            unique = true,
            length = 50
    )
    private String orderCode;

    /*
     * Order එක සමඟ customer details එකවර load කරනවා.
     */
    @ManyToOne(
            fetch = FetchType.EAGER,
            optional = false
    )
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User customer;

    @Column(
            nullable = false,
            length = 100
    )
    private String deliveryName;

    @Column(
            nullable = false,
            length = 20
    )
    private String deliveryMobile;

    @Column(
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String deliveryAddress;

    @Column(
            nullable = false,
            length = 20
    )
    private String postalCode;

    @Column(
            nullable = false,
            precision = 12,
            scale = 2
    )
    private BigDecimal total;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    /*
     * වැදගත් FIX:
     *
     * FetchType.EAGER නිසා order එක database එකෙන්
     * ලබාගන්නා විට order items ද එකවර load වෙනවා.
     *
     * එවිට frontend එකට JSON response එක හදන විට
     * LazyInitializationException එක එන්නේ නැහැ.
     */
    @OneToMany(
            mappedBy = "order",
            fetch = FetchType.EAGER,
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @Builder.Default
    private List<OrderItem> items =
            new ArrayList<>();

    @Column(
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    public void beforeInsert() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }

        updatedAt = LocalDateTime.now();

        if (status == null) {
            status = OrderStatus.SUCCESS;
        }
    }

    @PreUpdate
    public void beforeUpdate() {
        updatedAt = LocalDateTime.now();
    }
}