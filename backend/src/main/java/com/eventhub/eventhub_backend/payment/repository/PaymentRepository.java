package com.eventhub.eventhub_backend.payment.repository;

import com.eventhub.eventhub_backend.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, String> {

    Optional<Payment> findByProviderAndProviderTransactionId(String provider, String providerTransactionId);
}
