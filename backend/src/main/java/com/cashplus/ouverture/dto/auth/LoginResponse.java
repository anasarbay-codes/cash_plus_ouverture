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
public class LoginResponse {

    private String token;
    private String name;
    private String email;
    private Role role;
}
