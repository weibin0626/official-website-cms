import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Collapse,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import InsertPageBreakIcon from '@mui/icons-material/InsertPageBreak';

export interface TreeNodeData {
  id: string;
  name: string;
  parentId: string | null;
  type?: string;
  sort?: number;
  children: TreeNodeData[];
  [key: string]: any;
}

interface TreeViewProps {
  data: TreeNodeData[];
  selectedId?: string | null;
  onSelect?: (node: TreeNodeData) => void;
  onAddChild?: (parent: TreeNodeData) => void;
  onEdit?: (node: TreeNodeData) => void;
  onDelete?: (node: TreeNodeData) => void;
  onAddRoot?: () => void;
}

/** Single tree node component with expand/collapse and context menu */
const TreeNode: React.FC<{
  node: TreeNodeData;
  level: number;
  selectedId?: string | null;
  onSelect?: (node: TreeNodeData) => void;
  onAddChild?: (parent: TreeNodeData) => void;
  onEdit?: (node: TreeNodeData) => void;
  onDelete?: (node: TreeNodeData) => void;
}> = ({ node, level, selectedId, onSelect, onAddChild, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(true);
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);

  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedId === node.id;

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((prev) => !prev);
  }, []);

  const handleSelect = useCallback(() => {
    onSelect?.(node);
  }, [node, onSelect]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ mouseX: e.clientX - 2, mouseY: e.clientY - 4 });
  }, []);

  const handleCloseMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  return (
    <Box>
      <Box
        onClick={handleSelect}
        onContextMenu={handleContextMenu}
        sx={{
          display: 'flex',
          alignItems: 'center',
          pl: level * 2,
          py: 0.5,
          pr: 1,
          cursor: 'pointer',
          borderRadius: 0.5,
          bgcolor: isSelected ? 'primary.light' : 'transparent',
          '&:hover': {
            bgcolor: isSelected ? 'primary.light' : 'action.hover',
          },
          userSelect: 'none',
        }}
      >
        <IconButton size="small" onClick={handleToggle} sx={{ mr: 0.5 }}>
          {hasChildren ? (
            expanded ? (
              <ChevronLeftIcon fontSize="small" />
            ) : (
              <ChevronRightIcon fontSize="small" />
            )
          ) : (
            <InsertPageBreakIcon fontSize="small" sx={{ opacity: 0.3 }} />
          )}
        </IconButton>
        {hasChildren ? (
          expanded ? (
            <FolderOpenIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
          ) : (
            <FolderIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
          )
        ) : (
          <InsertPageBreakIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
        )}
        <Typography variant="body2" noWrap sx={{ flex: 1, fontWeight: isSelected ? 600 : 400 }}>
          {node.name}
        </Typography>
      </Box>

      {hasChildren && (
        <Collapse in={expanded} timeout="auto" unmountOnExit={false}>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              onAddChild={onAddChild}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </Collapse>
      )}

      {/* Right-click context menu */}
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem
          onClick={() => {
            handleCloseMenu();
            onAddChild?.(node);
          }}
        >
          <ListItemIcon><AddIcon fontSize="small" /></ListItemIcon>
          <ListItemText>新增子栏目</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleCloseMenu();
            onEdit?.(node);
          }}
        >
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>编辑</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleCloseMenu();
            onDelete?.(node);
          }}
        >
          <ListItemIcon><DeleteOutlineIcon fontSize="small" /></ListItemIcon>
          <ListItemText>删除</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

/** Full tree view component */
const TreeView: React.FC<TreeViewProps> = ({
  data,
  selectedId,
  onSelect,
  onAddChild,
  onEdit,
  onDelete,
  onAddRoot,
}) => {
  return (
    <Box sx={{ py: 1 }}>
      {onAddRoot && (
        <Box sx={{ px: 1, pb: 1 }}>
          <IconButton size="small" onClick={onAddRoot} color="primary" title="新增根栏目">
            <AddIcon />
          </IconButton>
        </Box>
      )}
      {data.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 4, textAlign: 'center' }}>
          暂无栏目，点击 + 新增根栏目
        </Typography>
      ) : (
        data.map((node) => (
          <TreeNode
            key={node.id}
            node={node}
            level={0}
            selectedId={selectedId}
            onSelect={onSelect}
            onAddChild={onAddChild}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      )}
    </Box>
  );
};

export default TreeView;
