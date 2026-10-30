package com.eventhub.eventhub_backend.admin.service;

import com.eventhub.eventhub_backend.admin.dto.request.UpdateUserStatusRequest;
import com.eventhub.eventhub_backend.admin.dto.response.UserAdminResponse;
import com.eventhub.eventhub_backend.common.response.PageResponse;
import com.eventhub.eventhub_backend.user.entity.Role;
import com.eventhub.eventhub_backend.user.entity.Status;
import org.springframework.data.domain.Pageable;

public interface AdminUserService {

    PageResponse<UserAdminResponse> getUsers(String keyword, Role role, Status status, Pageable pageable);

    UserAdminResponse updateUserStatus(String userId, UpdateUserStatusRequest request);
}
