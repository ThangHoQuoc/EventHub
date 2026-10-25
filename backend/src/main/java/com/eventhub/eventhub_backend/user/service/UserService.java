package com.eventhub.eventhub_backend.user.service;

import com.eventhub.eventhub_backend.user.dto.request.ChangePasswordRequest;
import com.eventhub.eventhub_backend.user.dto.request.UpdateUserProfileRequest;
import com.eventhub.eventhub_backend.user.dto.response.UserResponse;

public interface UserService {

    UserResponse updateProfile(UpdateUserProfileRequest request);

    void changePassword(ChangePasswordRequest request);
}
