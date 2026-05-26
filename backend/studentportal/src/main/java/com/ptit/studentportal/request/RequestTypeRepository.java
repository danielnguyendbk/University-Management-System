package com.ptit.studentportal.request;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RequestTypeRepository extends JpaRepository<RequestType, Long> {

    Optional<RequestType> findByRequestTypeCode(String requestTypeCode);
}
