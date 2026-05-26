package com.ptit.studentportal.request;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "request_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RequestType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_type_id")
    private Long requestTypeId;

    @Column(name = "request_type_code", nullable = false, unique = true, length = 50)
    private String requestTypeCode;

    @Column(name = "request_type_name", nullable = false, length = 150)
    private String requestTypeName;
}
