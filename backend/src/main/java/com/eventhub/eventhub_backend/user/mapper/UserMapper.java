package com.eventhub.eventhub_backend.user.mapper;

import com.eventhub.eventhub_backend.auth.dto.request.RegisterRequest;
import com.eventhub.eventhub_backend.auth.dto.response.RegisterResponse;
import com.eventhub.eventhub_backend.user.dto.response.UserResponse;
import com.eventhub.eventhub_backend.user.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "role", ignore = true)
    @Mapping(target = "status", ignore = true)
    User toUser(RegisterRequest request);

    RegisterResponse toRegisterResponse(User user);

    UserResponse toUserResponse(User user);

}