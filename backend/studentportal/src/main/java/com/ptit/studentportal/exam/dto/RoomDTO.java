package com.ptit.studentportal.exam.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomDTO {
    private Long roomId;
    private String roomCode;
    private String building;
    private Integer capacity;
}
