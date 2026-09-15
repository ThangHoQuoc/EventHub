package com.eventhub.eventhub_backend.user.service;


import com.eventhub.eventhub_backend.user.dto.response.UserResponse;
import com.eventhub.eventhub_backend.user.entity.Role;

public interface CurrentUserService {

    UserResponse getCurrentUser();

    String getCurrentUserId();

    public Role getCurrentUserRole();


}