package com.eventhub.eventhub_backend.admin.service.Impl;

import com.eventhub.eventhub_backend.admin.dto.request.UpdateUserStatusRequest;
import com.eventhub.eventhub_backend.admin.dto.response.UserAdminResponse;
import com.eventhub.eventhub_backend.admin.service.AdminUserService;
import com.eventhub.eventhub_backend.common.exception.AppException;
import com.eventhub.eventhub_backend.common.exception.ErrorCode;
import com.eventhub.eventhub_backend.common.response.PageResponse;
import com.eventhub.eventhub_backend.user.entity.Role;
import com.eventhub.eventhub_backend.user.entity.Status;
import com.eventhub.eventhub_backend.user.entity.User;
import com.eventhub.eventhub_backend.user.repository.UserRepository;
import com.eventhub.eventhub_backend.user.service.CurrentUserService;
import jakarta.persistence.criteria.Predicate;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminUserServiceImpl implements AdminUserService {

    UserRepository userRepository;
    CurrentUserService currentUserService;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserAdminResponse> getUsers(String keyword, Role role, Status status, Pageable pageable) {
        Specification<User> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(keyword)) {
                String searchPattern = "%" + keyword.trim().toLowerCase() + "%";
                Predicate emailPredicate = cb.like(cb.lower(root.get("email")), searchPattern);
                Predicate namePredicate = cb.like(cb.lower(root.get("fullName")), searchPattern);
                Predicate phonePredicate = cb.like(cb.lower(root.get("phone")), searchPattern);
                predicates.add(cb.or(emailPredicate, namePredicate, phonePredicate));
            }

            if (role != null) {
                predicates.add(cb.equal(root.get("role"), role));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<UserAdminResponse> page = userRepository.findAll(spec, pageable)
                .map(this::toResponse);

        return PageResponse.<UserAdminResponse>builder()
                .content(page.getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }

    @Override
    @Transactional
    public UserAdminResponse updateUserStatus(String userId, UpdateUserStatusRequest request) {
        if (!StringUtils.hasText(userId) || request == null || request.getStatus() == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        String currentUserId = currentUserService.getCurrentUserId();
        if (userId.equals(currentUserId) && request.getStatus() != Status.ACTIVE) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        user.setStatus(request.getStatus());
        User savedUser = userRepository.save(user);

        return toResponse(savedUser);
    }

    private UserAdminResponse toResponse(User user) {
        return UserAdminResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
