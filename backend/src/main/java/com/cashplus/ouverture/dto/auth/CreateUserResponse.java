package com.cashplus.ouverture.dto.auth;

import com.cashplus.ouverture.model.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateUserResponse {

    private Long id;
    private String name;
    private String email;
    private Role role;
}
